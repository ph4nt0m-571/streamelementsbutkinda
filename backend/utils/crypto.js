const crypto = require('crypto');

function verifyTwitchHMAC(messageId, timestamp, rawBody, signature) {
  const secret = process.env.TWITCH_WEBHOOK_SECRET;
  const hmacMessage = messageId + timestamp + rawBody;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(hmacMessage).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function generateOverlayToken() {
  return crypto.randomUUID();
}

module.exports = { verifyTwitchHMAC, generateOverlayToken };