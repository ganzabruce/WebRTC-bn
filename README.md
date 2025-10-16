# WebRTC Backend (Node.js)

Signaling + REST API for a React WebRTC client.

- Signaling: Socket.IO events (join, offer, answer, ice-candidate)
- REST: create room, get room info, health

## Run

```
cd server
npm install
npm run start
```

Server listens on :5000 by default.

## REST API

- GET /api/health → { ok: true }
- POST /api/rooms { id? } → { id }
- GET /api/rooms/:id → { id, occupants, createdAt }

## Socket.IO events

- client → join(roomId)
- client → offer { roomId, description, to? }
- client → answer { roomId, description, to? }
- client → ice-candidate { roomId, candidate, to? }
- server → peer-joined { id }
- server → peer-left { id }
- server → room-info { id, occupants }

Use same client logic from your React app to interact with signaling.
