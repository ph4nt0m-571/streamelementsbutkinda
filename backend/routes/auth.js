const router = require('express').Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { PrismaClient } = require('../../generated/prisma');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/authorize';
const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const TWITCH_USER_URL = 'https://api.twitch.tv/helix/users';

router.get('/twitch', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID,
    redirect_uri: process.env.TWITCH_REDIRECT_URI,
    response_type: 'code',
    scope: 'user:read:email channel:read:subscriptions bits:read moderator:read:followers',
  });
  res.redirect(`${TWITCH_AUTH_URL}?${params}`);
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  try {
    const tokenRes = await axios.post(TWITCH_TOKEN_URL, null, {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TWITCH_REDIRECT_URI,
      },
    });

    const { access_token, refresh_token } = tokenRes.data;

    const userRes = await axios.get(TWITCH_USER_URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID,
      },
    });

    const twitchUser = userRes.data.data[0];

    const user = await prisma.user.upsert({
      where: { twitchId: twitchUser.id },
      update: {
        displayName: twitchUser.display_name,
        email: twitchUser.email,
        profileImage: twitchUser.profile_image_url,
        accessToken: access_token,
        refreshToken: refresh_token,
      },
      create: {
        twitchId: twitchUser.id,
        displayName: twitchUser.display_name,
        email: twitchUser.email,
        profileImage: twitchUser.profile_image_url,
        accessToken: access_token,
        refreshToken: refresh_token,
      },
    });

    const token = jwt.sign(
      { userId: user.id, twitchId: user.twitchId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(process.env.FRONTEND_URL + '/dashboard');
  } catch (err) {
    console.error('Auth callback error:', err.message);
    res.redirect(process.env.FRONTEND_URL + '/login?error=auth_failed');
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', auth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      displayName: true,
      email: true,
      profileImage: true,
      overlayToken: true,
      createdAt: true,
    },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;