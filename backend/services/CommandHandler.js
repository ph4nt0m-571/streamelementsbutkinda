const { PrismaClient } = require('../../generated/prisma');
const { sanitizeText } = require('../utils/sanitize');

const prisma = new PrismaClient();
const cooldowns = new Map();

async function handle(userId, chatClient, channel, user, message) {
  if (!message.startsWith('!')) return;

  const trigger = message.split(' ')[0].toLowerCase();
  const args = message.split(' ').slice(1);

  const command = await prisma.command.findUnique({
    where: { userId_trigger: { userId, trigger } },
  });

  if (!command || !command.enabled) return;

  if (!hasPermission(command.permission, user)) return;

  const cooldownKey = `${userId}:${trigger}:${user.userId}`;
  const now = Date.now();
  const lastUsed = cooldowns.get(cooldownKey) || 0;
  if (now - lastUsed < command.cooldown * 1000) return;

  cooldowns.set(cooldownKey, now);
  setTimeout(() => cooldowns.delete(cooldownKey), command.cooldown * 1000 + 1000);

  const response = interpolate(command.response, { user: user.displayName, args: args.join(' ') });

  await chatClient.say(channel, sanitizeText(response));

  await prisma.command.update({
    where: { id: command.id },
    data: { useCount: { increment: 1 }, lastUsed: new Date() },
  });
}

function hasPermission(required, user) {
  if (required === 'everyone') return true;
  if (required === 'subscriber') return user.isSubscriber || user.isMod || user.isBroadcaster;
  if (required === 'moderator') return user.isMod || user.isBroadcaster;
  if (required === 'broadcaster') return user.isBroadcaster;
  return false;
}

function interpolate(template, data) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(data[key] ?? '').slice(0, 200));
}

module.exports = { handle };