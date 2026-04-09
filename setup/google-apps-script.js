/**
 * =========================================================================
 * Rainwater Partners — Google Apps Script (Server-Side)
 * =========================================================================
 *
 * This script does two things:
 *   1. Saves every form submission to a Google Sheet (extensible to any fields)
 *   2. Sends a confirmation email from info@rainwater.partners via Zoho ZeptoMail
 *
 * SETUP STEPS:
 *
 *   1. Create a new Google Sheet.
 *      - Copy the Sheet ID from the URL:
 *        https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
 *      - Paste it into SHEET_ID below.
 *
 *   2. Open Extensions → Apps Script in that Google Sheet.
 *      - Delete any default code and paste this entire file.
 *
 *   3. Set up Zoho ZeptoMail (for the confirmation email):
 *      - Go to https://zeptomail.zoho.com and sign in with your Zoho account.
 *      - Add & verify the domain: rainwater.partners
 *        (add the DNS records ZeptoMail gives you — SPF, DKIM, etc.)
 *      - Create a Mail Agent (e.g. "Rainwater Partners Waitlist").
 *      - Set the sending address to: info@rainwater.partners
 *      - Generate a Send Mail Token (API key).
 *      - Paste it into ZEPTOMAIL_API_KEY below.
 *
 *   4. Deploy this Apps Script as a Web App:
 *      - Click Deploy → New deployment
 *      - Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *      - Click Deploy and authorize when prompted.
 *      - Copy the Web App URL.
 *      - Paste it into SCRIPT_URL in js/main.js on your site.
 *
 *   5. Test by submitting the form on your site.
 *      - Check the Google Sheet for the new row.
 *      - Check for the confirmation email.
 *
 * EXTENSIBILITY:
 *   - If you add/remove/rename form fields, this script auto-adapts.
 *   - New fields become new columns. Removed fields leave the column but
 *     write empty cells. No code changes needed.
 *
 * =========================================================================
 */

// --------------- CONFIGURATION ---------------

var SHEET_ID = 'REPLACE_WITH_YOUR_GOOGLE_SHEET_ID';

var ZEPTOMAIL_API_KEY = 'REPLACE_WITH_YOUR_ZEPTOMAIL_SEND_MAIL_TOKEN';

var FROM_EMAIL = 'info@rainwater.partners';
var FROM_NAME  = 'Rainwater Partners';

// --------------- WEB APP ENTRY POINT ---------------

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    appendToSheet(data);
    sendConfirmationEmail(data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --------------- GOOGLE SHEETS ---------------

/**
 * Appends form data to the sheet. Dynamically creates/extends columns
 * so the form can change without touching this code.
 */
function appendToSheet(data) {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  var lastCol = sheet.getLastColumn();

  // Read existing headers (row 1)
  var headers = lastCol > 0
    ? sheet.getRange(1, 1, 1, lastCol).getValues()[0]
    : [];

  // Always include a timestamp column
  if (headers.indexOf('timestamp') === -1) {
    headers.push('timestamp');
  }

  // Add any new fields from this submission
  var dataKeys = Object.keys(data);
  dataKeys.forEach(function (key) {
    if (headers.indexOf(key) === -1) {
      headers.push(key);
    }
  });

  // Write headers back (in case new columns were added)
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Build the row in header order
  var row = headers.map(function (col) {
    if (col === 'timestamp') return new Date().toISOString();
    return data[col] || '';
  });

  sheet.appendRow(row);
}

// --------------- ZOHO ZEPTOMAIL CONFIRMATION EMAIL ---------------

/**
 * Sends a confirmation email via Zoho ZeptoMail's transactional email API.
 * Uses the contactName field for the greeting (falls back to the email).
 */
function sendConfirmationEmail(data) {
  if (!data.email) return;
  if (!ZEPTOMAIL_API_KEY || ZEPTOMAIL_API_KEY === 'REPLACE_WITH_YOUR_ZEPTOMAIL_SEND_MAIL_TOKEN') return;

  // Extract first name from contactName (everything before the first space)
  var firstName = (data.contactName || '').split(' ')[0] || 'there';

  var subject = 'Thanks \u2014 we\u2019ve got your info';

  var body =
    firstName + ',\n\n' +
    'Thanks for signing up for Rainwater Partners.\n\n' +
    'As more companies join the waitlist, I\u2019ll be reaching out directly to ' +
    'make sure we\u2019re prioritizing the vendors and suppliers that matter most to you.\n\n' +
    'Excited to partner together.\n\n' +
    'Jamie MacFarlane\n' +
    'Member, ARCSA\n' +
    'Founder, Rainwater Partners';

  var htmlBody =
    '<p>' + firstName + ',</p>' +
    '<p>Thanks for signing up for Rainwater Partners.</p>' +
    '<p>As more companies join the waitlist, I\u2019ll be reaching out directly to ' +
    'make sure we\u2019re prioritizing the vendors and suppliers that matter most to you.</p>' +
    '<p>Excited to partner together.</p>' +
    '<p>' +
    'Jamie MacFarlane<br>' +
    'Member, ARCSA<br>' +
    'Founder, Rainwater Partners' +
    '</p>';

  var payload = {
    from: { address: FROM_EMAIL, name: FROM_NAME },
    to: [{ email_address: { address: data.email, name: data.contactName || '' } }],
    subject: subject,
    textbody: body,
    htmlbody: htmlBody
  };

  UrlFetchApp.fetch('https://api.zeptomail.com/v1.1/email', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Zoho-enczapikey ' + ZEPTOMAIL_API_KEY
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}
