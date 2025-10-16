import { nanoid } from 'nanoid';

class RoomsService {
  constructor() {
    this.rooms = new Map(); // roomId -> { participants: Set<string>, createdAt: number }
    this.bySocket = new Map(); // socketId -> Set<roomId>
  }

  create(customId) {
    const id = customId || nanoid(8);
    if (!this.rooms.has(id)) {
      this.rooms.set(id, { participants: new Set(), createdAt: Date.now() });
    }
    return id;
  }

  join(roomId, socketId) {
    this.create(roomId);
    const r = this.rooms.get(roomId);
    r.participants.add(socketId);
    if (!this.bySocket.has(socketId)) this.bySocket.set(socketId, new Set());
    this.bySocket.get(socketId).add(roomId);
    return r;
  }

  leave(roomId, socketId) {
    const r = this.rooms.get(roomId);
    if (!r) return;
    r.participants.delete(socketId);
    if (r.participants.size === 0) this.rooms.delete(roomId);
    const set = this.bySocket.get(socketId);
    if (set) {
      set.delete(roomId);
      if (set.size === 0) this.bySocket.delete(socketId);
    }
  }

  leaveAll(socketId) {
    const set = this.bySocket.get(socketId) || new Set();
    [...set].forEach((roomId) => this.leave(roomId, socketId));
    return [...set];
  }

  get(roomId) {
    return this.rooms.get(roomId);
  }
}

const rooms = new RoomsService();
export default rooms;
