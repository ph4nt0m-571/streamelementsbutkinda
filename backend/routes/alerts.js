const router = require('express').Router();
const { PrismaClient } = require('../../generated/prisma');
const auth = require('../middleware/auth');
const { alertRules, idParam } = require('../middleware/validate');

const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const alerts = await prisma.alert.findMany({ where: { userId: req.user.userId } });
    res.json(alerts);
  } catch (err) { next(err); }
});

router.post('/', alertRules, async (req, res, next) => {
  try {
    const alert = await prisma.alert.upsert({
      where: { userId_eventType: { userId: req.user.userId, eventType: req.body.eventType } },
      update: { ...req.body },
      create: { userId: req.user.userId, ...req.body },
    });
    res.status(201).json(alert);
  } catch (err) { next(err); }
});

router.put('/:id', idParam, alertRules, async (req, res, next) => {
  try {
    const existing = await prisma.alert.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(alert);
  } catch (err) { next(err); }
});

router.delete('/:id', idParam, async (req, res, next) => {
  try {
    const existing = await prisma.alert.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    await prisma.alert.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;