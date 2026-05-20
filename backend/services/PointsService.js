const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();
const activeViewers = new Map();

function trackViewer(userId, viewerId, viewerName) {
  const key = `${userId}:${viewerId}`;
  activeViewers.set(key, { userId, viewerId, viewerName, since: Date.now() });
}

function untrackViewer(userId, viewerId) {
  activeViewers.delete(`${userId}:${viewerId}`);
}

async function tick() {
  const configs = await prisma.loyaltyConfig.findMany({ where: { enabled: true } });
  const configMap = new Map(configs.map(c => [c.userId, c]));

  const updates = [];
  for (const [, viewer] of activeViewers) {
    const config = configMap.get(viewer.userId);
    if (!config) continue;
    updates.push({ viewer, pts: config.pointsPerMin });
  }

  for (const { viewer, pts } of updates) {
    await prisma.points.upsert({
      where: { userId_viewerId: { userId: viewer.userId, viewerId: viewer.viewerId } },
      update: { balance: { increment: pts }, totalEarned: { increment: pts }, updatedAt: new Date() },
      create: {
        userId: viewer.userId,
        viewerId: viewer.viewerId,
        viewerName: viewer.viewerName,
        balance: pts,
        totalEarned: pts,
        updatedAt: new Date(),
      },
    });
  }
}

async function redeem(userId, viewerId, cost) {
  const points = await prisma.points.findUnique({
    where: { userId_viewerId: { userId, viewerId } },
  });
  if (!points || points.balance < cost) throw new Error('Insufficient points');
  return prisma.points.update({
    where: { userId_viewerId: { userId, viewerId } },
    data: { balance: { decrement: cost } },
  });
}

setInterval(tick, 60 * 1000);

module.exports = { trackViewer, untrackViewer, redeem };