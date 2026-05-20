const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

let io;

function init(ioInstance) {
  io = ioInstance;

  io.on('connection', async (socket) => {
    const token = socket.handshake.auth?.token;
    if (!token) return socket.disconnect(true);

    const user = await prisma.user.findUnique({ where: { overlayToken: token } });
    if (!user) return socket.disconnect(true);

    socket.join(`overlay:${user.id}`);
    socket.on('disconnect', () => {});
  });
}

function emitToUser(userId, event, data) {
  if (!io) return;
  io.to(`overlay:${userId}`).emit(event, data);
}

module.exports = { init, emitToUser };