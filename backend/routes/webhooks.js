const router = require('express').Router();
const { verifyTwitchHMAC } = require('../utils/crypto');
const AlertService = require('../services/AlertService');
const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

// Raw body needed for HMAC verification
router.post('/twitch', express.raw({ type: 'application/json' }), async (req, res) => {
  const messageId = req.headers['twitch-eventsub-message-id'];
  const timestamp = req.headers['twitch-eventsub-message-timestamp'];
  const signature = req.headers['twitch-eventsub-message-signature'];
  const type = req.headers['twitch-eventsub-message-type'];

  if (!verifyTwitchHMAC(messageId, timestamp, req.body, signature)) {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  // Replay protection - Twitch resends on failure
  const age = Date.now() - new Date(timestamp).getTime();
  if (age > 10 * 60 * 1000) return res.status(403).json({ error: 'Message too old' });

  res.sendStatus(204);

  const body = JSON.parse(req.body);

  if (type === 'webhook_callback_verification') {
    return res.status(200).send(body.challenge);
  }

  if (type === 'notification') {
    const broadcasterId = body.event?.broadcaster_user_id;
    if (!broadcasterId) return;

    const user = await prisma.user.findUnique({ where: { twitchId: broadcasterId } });
    if (!user) return;

    AlertService.dispatch(user.id, body.subscription.type, body.event);
  }
});

module.exports = router;