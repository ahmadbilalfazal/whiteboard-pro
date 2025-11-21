# whiteboard-pro
Real-time collaborative whiteboard built with WebSockets and Canvas.
Run locally with Docker Compose or with local Node/npm.

## Quickstart (Docker)
docker-compose up --build

Frontend: http://localhost:5173
Backend WS endpoint: ws://localhost:3000/ws

## Quickstart (local)
# server
cd server
npm install
npm run dev

# client
cd client
npm install
npm run dev
