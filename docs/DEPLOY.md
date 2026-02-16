# Deployment Guide (Optional)

## Firebase Project Setup

1. Create project at https://console.firebase.google.com
2. Enable Firestore, Storage, Authentication
3. Add web app to get config

## Environment Config

Create `.env` (NOT in git):

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender
VITE_FIREBASE_APP_ID=your_app_id
```

Update `src/services/firebase.ts` to use env vars.

## Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Deploy Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

## Deploy Hosting (optional)

```bash
npm run build
firebase deploy --only hosting
```

## Security Notes

- Never commit service account keys
- Use Firebase Auth rules to protect data
- Enable App Check for production
