# Pixe-Art-Generator

A local tool (Node 22 + Vue 3) that validates a character grid against a palette and renders it as a pixel-art PNG image.

**Goal:** You provide a text grid (each character maps to a color) and a palette (allowed characters and their colors). The app validates that every character in the grid is in the palette and that the grid is rectangular, then generates a PNG where each character is drawn as a colored pixel.

## Local setup

### Backend
```
cd server
npm install
npm run start
```

### Frontend
```
cd client
npm install
npm run dev
```

By default, the client calls `http://localhost:3001`.

## Docker (2 services)

```
docker compose up --build
```

- Client: http://localhost:5173
- API: http://localhost:3001

For Orbstack, this setup stays light (Node Alpine + nginx images).
