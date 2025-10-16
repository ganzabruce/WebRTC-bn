import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import rooms from './services/rooms.js';
import roomsRouter from './routes/rooms.js';
import errorHandler from './middleware/error.js';
import dotenv from "dotenv"
dotenv.config()
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// REST routes for React clients
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/rooms', roomsRouter);

const server = http.createServer(app);

// Socket.IO signaling
const io = new SocketIOServer(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('join', (roomId) => {
    if (!roomId) return;
    rooms.join(roomId, socket.id);
    socket.join(roomId);
    const info = rooms.get(roomId);
    socket.emit('room-info', { id: roomId, occupants: info.participants.size });
    socket.to(roomId).emit('peer-joined', { id: socket.id });
  });

  socket.on('offer', ({ roomId, description, to }) => {
    if (to) io.to(to).emit('offer', { from: socket.id, description });
    else if (roomId) socket.to(roomId).emit('offer', { from: socket.id, description });
  });

  socket.on('answer', ({ roomId, description, to }) => {
    if (to) io.to(to).emit('answer', { from: socket.id, description });
    else if (roomId) socket.to(roomId).emit('answer', { from: socket.id, description });
  });

  socket.on('ice-candidate', ({ roomId, candidate, to }) => {
    if (to) io.to(to).emit('ice-candidate', { from: socket.id, candidate });
    else if (roomId) socket.to(roomId).emit('ice-candidate', { from: socket.id, candidate });
  });

  socket.on('disconnect', () => {
    const affectedRooms = rooms.leaveAll(socket.id);
    affectedRooms.forEach((roomId) => socket.to(roomId).emit('peer-left', { id: socket.id }));
    console.log('socket disconnected', socket.id);
  });
});

app.use(errorHandler);

const PORT = process.env.PORT ;
server.listen(PORT, () => {
  console.log(`Signaling/REST server running on :${PORT}`);
});
