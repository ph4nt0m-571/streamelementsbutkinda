require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const authRoutes = require('./src/routes/auth');
const alertRoutes = require('./src/routes/alerts');
const overlayRoutes = require('./src/routes/overlays');
const commandRoutes = require('./src/routes/commands');
const loyaltyRoutes = require('./src/routes/loyalty');
const webhookRoutes = require('./src/routes/webhooks');
const errorHandler = require('./src/middleware/errorHandler');
const { authLimiter, apiLimiter } = require('./src/middleware/rateLimit');
const SocketManager = require('./src/ws/SocketManager');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use('/auth', authLimiter, authRoutes);
app.use('/api/alerts', apiLimiter, alertRoutes);
app.use('/api/overlays', apiLimiter, overlayRoutes);
app.use('/api/commands', apiLimiter, commandRoutes);
app.use('/api/loyalty', apiLimiter, loyaltyRoutes);
app.use('/webhooks', webhookRoutes);

SocketManager.init(io);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));