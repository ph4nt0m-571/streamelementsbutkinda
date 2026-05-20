const router = require('express').Router();
const { PrismaClient } = require('../../generated/prisma');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Public — used by overlay app in OBS
router.get('/config/:token', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { overlayToken: req.params.token },
      include: { overlayConfig: true, alerts: true },
    });
    if (!user) return res.status(404).json({ error: 'Invalid overlay token' });

    res.json({
      widgets: user.overlayConfig?.widgets ?? [],
      alerts: user.alerts.filter(a => a.enabled),
    });
  } catch (err) { next(err); }
});

// Protected — dashboard config management
router.use(auth);

router.get('/config', async (req, res, next) => {
  try {
    const config = await prisma.overlayConfig.findUnique({
      where: { userId: req.user.userId },
    });
    res.json(config ?? { widgets: [] });
  } catch (err) { next(err); }
});

router.put('/config', async (req, res, next) => {
  try {
    const { widgets } = req.body;
    if (!Array.isArray(widgets)) return res.status(400).json({ error: 'widgets must be an array' });

    const config = await prisma.overlayConfig.upsert({
      where: { userId: req.user.userId },
      update: { widgets },
      create: { userId: req.user.userId, widgets },
    });
    res.json(config);
  } catch (err) { next(err); }
});

router.post('/regenerate-token', async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { overlayToken: uuidv4() },
      select: { overlayToken: true },
    });
    res.json({ overlayToken: user.overlayToken });
  } catch (err) { next(err); }
});

module.exports = router;