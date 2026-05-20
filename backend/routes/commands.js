const router = require('express').Router();
const { PrismaClient } = require('../../generated/prisma');
const auth = require('../middleware/auth');
const { commandRules, idParam } = require('../middleware/validate');

const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const commands = await prisma.command.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'asc' },
    });
    res.json(commands);
  } catch (err) { next(err); }
});

router.post('/', commandRules, async (req, res, next) => {
  try {
    const count = await prisma.command.count({ where: { userId: req.user.userId } });
    if (count >= 100) return res.status(400).json({ error: 'Max 100 commands allowed' });

    const command = await prisma.command.create({
      data: { userId: req.user.userId, ...req.body },
    });
    res.status(201).json(command);
  } catch (err) { next(err); }
});

router.put('/:id', idParam, commandRules, async (req, res, next) => {
  try {
    const existing = await prisma.command.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const command = await prisma.command.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(command);
  } catch (err) { next(err); }
});

router.delete('/:id', idParam, async (req, res, next) => {
  try {
    const existing = await prisma.command.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    await prisma.command.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;