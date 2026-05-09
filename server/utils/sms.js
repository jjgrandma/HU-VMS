const AfricasTalking = require('africastalking');

let smsClient = null;

function getSmsClient() {
  if (!smsClient) {
    const apiKey   = process.env.AT_API_KEY;
    const username = process.env.AT_USERNAME;
    if (!apiKey || !username) return null;
    const at = AfricasTalking({ apiKey, username });
    smsClient = at.SMS;
  }
  return smsClient;
}

/**
 * Send an SMS message. Fails silently — never throws.
 * @param {string|string[]} to   - Phone number(s) e.g. '+251911123456'
 * @param {string}          body - Message text
 */
async function sendSMS(to, body) {
  try {
    const client = getSmsClient();
    if (!client) {
      console.warn('[SMS] Skipped — AT_API_KEY or AT_USERNAME not set in .env');
      return;
    }
    const recipients = Array.isArray(to) ? to : [to];
    const validNumbers = recipients.filter(Boolean);
    if (!validNumbers.length) return;

    await client.send({ to: validNumbers, message: body, from: process.env.AT_SENDER_ID || undefined });
    console.log(`[SMS] Sent to ${validNumbers.join(', ')}`);
  } catch (err) {
    console.error('[SMS] Failed:', err.message);
  }
}

module.exports = { sendSMS };
