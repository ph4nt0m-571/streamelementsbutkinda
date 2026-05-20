const { PrismaClient } = require('../../generated/prisma');
const { emitToUser } = require('../ws/SocketManager');
const { sanitizeText } = require('../utils/sanitize');

const prisma = new PrismaClient();
const recentEvents = new Map();

async function dispatch(userId, eventType, eventData) {
  const dedupeKey = `${userId}:${eventType}:${eventData?.user_id || ''}`;
  const now = Date.now();

  if (recentEvents.has(dedupeKey) && now - recentEvents.get(dedupeKey) < 2000) return;
  recentEvents.set(dedupeKey, now);

  setTimeout(() => recentEvents.delete(dedupeKey), 10000);

  const alert = await prisma.alert.findUnique({
    where: { userId_eventType: { userId, eventType } },
  });

  if (!alert || !alert.enabled) return;

  const message = alert.messageTemplate
    ? interpolate(alert.messageTemplate, eventData)
    : null;

  emitToUser(userId, 'alert', {
    eventType,
    gifUrl: alert.gifUrl,
    soundUrl: alert.soundUrl,
    message: message ? sanitizeText(message) : null,
    animationIn: alert.animationIn,
    animationOut: alert.animationOut,
    duration: alert.duration,
    volume: alert.volume,
    eventData,
  });
}

function interpolate(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = data?.[key] ?? data?.[`${key}_name`] ?? '';
    return String(val).slice(0, 100);
  });
}

module.exports = { dispatch };