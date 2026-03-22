# OmegaBot

Discord bot for OmegaBot Dashboard

## Features

- Welcome/Leave Messages
- Verification System
- Ticket System
- Custom Notifications
- Music System

## Deployment

### Railway (24/7)
1. Go to https://railway.app
2. Login with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select this repository
5. Add environment variables:
   - `DISCORD_BOT_TOKEN`: Your bot token
   - `FIREBASE_API_KEY`: Firebase API key
   - `FIREBASE_AUTH_DOMAIN`: Firebase auth domain
   - `FIREBASE_DATABASE_URL`: Firebase database URL
   - `FIREBASE_PROJECT_ID`: Firebase project ID

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DISCORD_BOT_TOKEN` | Discord bot token |
| `FIREBASE_API_KEY` | Firebase API key |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `FIREBASE_DATABASE_URL` | Firebase database URL |
| `FIREBASE_PROJECT_ID` | Firebase project ID |

## Commands

- `npm start` - Start the bot
