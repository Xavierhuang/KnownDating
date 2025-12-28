# Setup Guide for Known App

This guide will help you get the Known dating app up and running on your local machine.

## Prerequisites

Make sure you have the following installed:
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

## Quick Start

### 1. Install Dependencies

Open two terminal windows.

**Terminal 1 - Install server dependencies:**
```bash
cd "/Users/weijiahuang/Desktop/FoundersLove/server"
npm install
```

**Terminal 2 - Install client dependencies:**
```bash
cd "/Users/weijiahuang/Desktop/FoundersLove/client"
npm install
```

### 2. Initialize the Database

In Terminal 1 (server directory), run:
```bash
npm run db:init
```

This will:
- Create the SQLite database
- Set up all necessary tables
- Add 5 sample users for testing

### 3. Start the Backend Server

In Terminal 1 (server directory):
```bash
npm run dev
```

You should see:
```
Server running on http://localhost:3001
Environment: development
```

### 4. Start the Frontend

In Terminal 2 (client directory):
```bash
npm run dev
```

You should see:
```
VITE ready in X ms
➜  Local:   http://localhost:5173/
```

### 5. Open the App

Open your browser and navigate to: **http://localhost:5173**

## Test Accounts

You can log in with any of these sample accounts:

| Email | Password | Name |
|-------|----------|------|
| alice@example.com | password123 | Alice |
| bob@example.com | password123 | Bob |
| charlie@example.com | password123 | Charlie |
| diana@example.com | password123 | Diana |
| evan@example.com | password123 | Evan |

## Features to Try

1. **Login** - Use one of the test accounts above
2. **Discover** - Swipe left (pass) or right (like) on profiles
3. **Matches** - View your matches when two users like each other
4. **Chat** - Send real-time messages to your matches
5. **Profile** - Edit your profile information

## Troubleshooting

### Port Already in Use

If port 3001 or 5173 is already in use:

**For Backend (3001):**
- Edit `server/.env` and change `PORT=3001` to another port

**For Frontend (5173):**
- Edit `client/vite.config.ts` and change the port in server config

### Database Issues

If you encounter database issues:
```bash
cd server
rm database.sqlite
npm run db:init
```

### Dependencies Issues

If you encounter module errors:
```bash
# In server directory
rm -rf node_modules package-lock.json
npm install

# In client directory
rm -rf node_modules package-lock.json
npm install
```

## Project Structure

```
cuffing-season/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # API client, socket client
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── database/      # Database setup
│   │   ├── middleware/    # Auth middleware
│   │   ├── routes/        # API routes
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Entry point
│   └── package.json
│
└── README.md

```

## Development Tips

### Hot Reload

Both the frontend and backend support hot reload:
- **Frontend**: Changes to React files will automatically refresh
- **Backend**: Changes to TypeScript files will automatically restart the server

### API Endpoints

The frontend proxies API requests to the backend:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001/api`
- WebSocket: `ws://localhost:3001`

### Database Location

The SQLite database is stored at:
```
server/database.sqlite
```

You can use a SQLite viewer to inspect the database if needed.

## Building for Production

### Build Backend
```bash
cd server
npm run build
npm start
```

### Build Frontend
```bash
cd client
npm run build
npm run preview
```

## Need Help?

- Check the main README.md for feature documentation
- Review the API endpoints in README.md
- Check console logs in browser DevTools (F12)
- Check server terminal for backend errors

## Next Steps

- Add your own photos to user profiles
- Create more test users
- Customize the matching algorithm
- Add more profile fields
- Implement photo uploads

Enjoy using Known!

