# Known - Dating App

A modern, Tinder-style dating app. Swipe, match, and chat with potential partners.

## Features

- 🔥 Tinder-style swipe interface
- 💬 Real-time messaging
- 👤 User profiles with photos and bio
- ❤️ Smart matching algorithm
- 🔐 Secure authentication
- 📱 Responsive web design
- 📲 Mobile app ready (iOS & Android with Capacitor)

## Project Structure

```
known/
├── client/          # React + TypeScript frontend
├── server/          # Express + TypeScript backend
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Install dependencies for both client and server:

```bash
cd client
npm install
cd ../server
npm install
```

2. Start the development servers:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

3. Open your browser to `http://localhost:5173`

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)
- Socket.io Client (real-time chat)
- Framer Motion (animations)

### Backend
- Node.js with Express
- TypeScript
- SQLite (database)
- Socket.io (real-time communication)
- JWT (authentication)
- bcrypt (password hashing)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/discover` - Get potential matches
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update own profile

### Matches
- `POST /api/matches/swipe` - Swipe on a user
- `GET /api/matches` - Get all matches

### Messages
- `GET /api/messages/:matchId` - Get messages for a match
- `POST /api/messages` - Send a message

## Development Notes

- The app uses local services only for simplicity
- All times are displayed in New York time (EST/EDT)
- Professional icons used throughout (no emojis in UI)

## Mobile App Deployment

To convert this web app to iOS and Android mobile apps:

```bash
# Run the mobile setup script
./setup_mobile.sh

# Or follow the detailed guide
# See MOBILE_DEPLOYMENT.md for complete instructions
```

**Quick Overview:**
1. Install Capacitor dependencies
2. Build your React app: `npm run build`
3. Sync to native projects: `npx cap sync`
4. Open in Xcode/Android Studio: `npx cap open ios/android`
5. Build and deploy to app stores

See **MOBILE_DEPLOYMENT.md** for detailed steps, prerequisites, and deployment instructions.

## Documentation

- `README.md` - This file, overview and setup
- `SETUP.md` - Detailed setup and troubleshooting
- `FEATURES.md` - Complete feature documentation
- `COMMANDS.md` - All commands reference
- `MOBILE_DEPLOYMENT.md` - iOS/Android app deployment guide

## License

MIT

