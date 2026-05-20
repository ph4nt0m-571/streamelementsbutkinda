const { ApiClient } = require('@twurple/api');
const { RefreshingAuthProvider } = require('@twurple/auth');
const { EventSubWsListener } = require('@twurple/eventsub-ws');
const { PrismaClient } = require('../../generated/prisma');
const AlertService = require('./AlertService');

const prisma = new PrismaClient();
const listeners = new Map();

async function subscribeForUser(userId) {
  if (listeners.has(userId)) return;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const authProvider = new RefreshingAuthProvider({
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
  });

  await authProvider.addUserForToken({
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
    scope: [],
    expiresIn: 0,
    obtainmentTimestamp: 0,
  }, ['chat']);

  authProvider.onRefresh(async (uid, token) => {
    await prisma.user.update({
      where: { id: userId },
      data: { accessToken: token.accessToken, refreshToken: token.refreshToken },
    });
  });

  const apiClient = new ApiClient({ authProvider });
  const listener = new EventSubWsListener({ apiClient });

  await listener.start();

  await listener.subscribeToChannelFollowEvents(user.twitchId, user.twitchId, (e) => {
    AlertService.dispatch(userId, 'follow', { user_name: e.userDisplayName, user_id: e.userId });
  });

  await listener.subscribeToChannelSubscriptionEvents(user.twitchId, (e) => {
    AlertService.dispatch(userId, 'subscribe', { user_name: e.userDisplayName, tier: e.tier });
  });

  await listener.subscribeToChannelRaidEvents(user.twitchId, (e) => {
    AlertService.dispatch(userId, 'raid', { user_name: e.raidingBroadcasterDisplayName, viewers: e.viewers });
  });

  await listener.subscribeToChannelCheerEvents(user.twitchId, (e) => {
    AlertService.dispatch(userId, 'cheer', { user_name: e.userDisplayName, bits: e.bits });
  });

  await listener.subscribeToChannelSubscriptionGiftEvents(user.twitchId, (e) => {
    AlertService.dispatch(userId, 'gift_sub', { user_name: e.gifterDisplayName, amount: e.amount });
  });

  listeners.set(userId, listener);
}

async function unsubscribeForUser(userId) {
  const listener = listeners.get(userId);
  if (listener) {
    await listener.stop();
    listeners.delete(userId);
  }
}

module.exports = { subscribeForUser, unsubscribeForUser };