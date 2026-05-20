const router = require('express').Router();
const { PrismaClient } = require('../../generated/prisma');
const auth = require('../middleware/auth');
const { loyaltyRules } = require('../middleware/validate');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

router.use(auth);

router.get('/config', async (req, res, next) => {
  try {
    const config = await prisma.loyaltyConfig.findUnique({
      where: { userId: req.user.userId },
    });
    res.json(config ?? { currencyName: 'points', pointsPerMin: 1, enabled: false });
  } catch (err) { next(err); }
});

router.put('/config', loyaltyRules, async (req, res, next) => {
  try {
    const config = await prisma.loyaltyConfig.upsert({
      where: { userId: req.user.userId },
      update: req.body,
      create: { userId: req.user.userId, ...req.body },
    });
    res.json(config);
  } catch (err) { next(err); }
});

router.get('/leaderboard', async (req, res, next) => {
  try {
    const top = await prisma.points.findMany({
      where: { userId: req.user.userId },
      orderBy: { balance: 'desc' },
      take: 50,
      select: { viewerName: true, balance: true, totalEarned: true },
    });
    res.json(top);
  } catch (err) { next(err); }
});

router.get('/viewer/:viewerId', async (req, res, next) => {
  try {
    const points = await prisma.points.findUnique({
      where: { userId_viewerId: { userId: req.user.userId, viewerId: req.params.viewerId } },
    });
    res.json(points ?? { balance: 0, totalEarned: 0 });
  } catch (err) { next(err); }
});

module.exports = router;