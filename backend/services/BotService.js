const tmi = require('tmi.js');
const { PrismaClient } = require('../../generated/prisma');
const CommandHandler = require('./CommandHandler');

const prisma = new PrismaClient();
const clients = new Map();

async function connectForUser(userId) {
  if (clients.has(userId)) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const client = new tmi.Client({
    identity: {
      username: user.displayName,
      password: `oauth:${user.accessToken}`,
    },
    channels: [user.displayName],
    options: { debug: false },
  });

  client.on('message', (channel, tags, message, self) => {
    if (self) return;
    const chatUser = {
      userId: tags['user-id'],
      displayName: tags['display-name'],
      isSubscriber: tags.subscriber,
      isMod: tags.mod,
      isBroadcaster: tags['user-id'] === user.twitchId,
    };
    CommandHandler.handle(userId, client, channel, chatUser, message);
  });

  await client.connect();
  clients.set(userId, client);
}

async function disconnectForUser(userId) {
  const client = clients.get(userId);
  if (client) {
    await client.disconnect();
    clients.delete(userId);
  }
}

module.exports = { connectForUser, disconnectForUser };