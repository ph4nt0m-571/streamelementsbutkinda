const { validationResult, body, param } = require('express-validator');

const handle = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const alertRules = [
  body('eventType').isIn(['follow', 'subscribe', 'raid', 'cheer', 'gift_sub']),
  body('gifUrl').optional().isURL().isLength({ max: 500 }),
  body('soundUrl').optional().isURL().isLength({ max: 500 }),
  body('messageTemplate').optional().isString().isLength({ max: 200 }).escape(),
  body('animationIn').optional().isIn(['fadeIn', 'slideIn', 'bounceIn', 'zoomIn']),
  body('animationOut').optional().isIn(['fadeOut', 'slideOut', 'bounceOut', 'zoomOut']),
  body('duration').optional().isInt({ min: 1000, max: 30000 }),
  body('volume').optional().isFloat({ min: 0, max: 1 }),
  body('enabled').optional().isBoolean(),
  handle,
];

const commandRules = [
  body('trigger')
    .isString()
    .matches(/^![a-zA-Z0-9_]{1,30}$/)
    .withMessage('Trigger must start with ! and contain only letters/numbers/underscores, max 30 chars'),
  body('response').isString().isLength({ min: 1, max: 500 }).escape(),
  body('cooldown').optional().isInt({ min: 0, max: 3600 }),
  body('permission').optional().isIn(['everyone', 'subscriber', 'moderator', 'broadcaster']),
  body('enabled').optional().isBoolean(),
  handle,
];

const loyaltyRules = [
  body('currencyName').optional().isString().isLength({ min: 1, max: 30 }).escape(),
  body('pointsPerMin').optional().isInt({ min: 1, max: 1000 }),
  body('enabled').optional().isBoolean(),
  handle,
];

const idParam = [
  param('id').isUUID(),
  handle,
];

module.exports = { alertRules, commandRules, loyaltyRules, idParam };