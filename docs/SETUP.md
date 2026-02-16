# Setup Guide — Academic Weapon App

**Prerequisites:** Node.js 18+ and npm installed.

---

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify:
```bash
firebase --version
```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Firebase Login (Optional for Emulators)

For emulators, you don't strictly need to login. But to deploy later:

```bash
firebase login
```

---

## Step 4: Start Firebase Emulators

```bash
npm run emulators
```

This starts:
- Firestore emulator on port 8080
- Auth emulator on port 9099
- Storage emulator on port 9199
- Functions emulator on port 5001
- UI on port 4000

---

## Step 5: Start Frontend (in another terminal)

```bash
npm run dev
```

App runs on http://localhost:5173

---

## Step 6: Run Everything Together

```bash
npm run dev:all
```

This starts emulators + frontend concurrently.

---

## Firebase Config (No Secrets)

The app uses Firebase with emulators by default. No API keys needed for local dev.

When you're ready to deploy:
1. Create a Firebase project at https://console.firebase.google.com
2. Run `firebase init` and select your project
3. Copy the config (it will be auto-populated by firebase init)

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server only |
| `npm run emulators` | Start Firebase emulators only |
| `npm run dev:all` | Start both concurrently |
| `npm run build` | Build for production |
| `npm run test` | Run vitest tests |
| `npm run lint` | Run ESLint |

---

## Troubleshooting

**Emulators won't start:**
- Check ports 4000, 5001, 8080, 9099, 9199 are free
- Run `firebase emulators:start --only firestore,auth,storage,functions`

**Firebase CLI not found:**
- Make sure `npm install -g firebase-tools` completed
- On Mac/Linux, you may need `sudo`

**CORS errors:**
- Emulators handle CORS automatically
- Check you're using the emulator URLs, not production
