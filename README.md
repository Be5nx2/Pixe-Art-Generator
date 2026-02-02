# Pixe-Art-Generator

Outil local (Node 22 + Vue 3) pour valider un tableau de caractères et le rendre en pixel-art PNG.

## Démarrage local

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

Par défaut, le client appelle `http://localhost:3001`.

## Docker (2 services)

```
docker compose up --build
```

- Client: http://localhost:5173
- API: http://localhost:3001

Pour Orbstack, cette config reste légère (images Node alpine + nginx).
