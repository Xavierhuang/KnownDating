# Common Commands Reference

Quick reference for all commands you'll need to work with the Known app.

## 🚀 Quick Start

### Easiest Way (Recommended)

**macOS/Linux:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

This will automatically:
- Check for Node.js
- Install dependencies if needed
- Initialize the database
- Start both servers

## 📦 Installation Commands

### First Time Setup

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install

# Initialize database with sample data
cd ../server
npm run db:init
```

## 🏃 Running the App

### Development Mode (Manual)

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

### Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Backend Health Check: http://localhost:3001/api/health

## 🗄️ Database Commands

### Initialize/Reset Database
```bash
cd server
npm run db:init
```

### Delete Database (Start Fresh)
```bash
cd server
rm database.sqlite
npm run db:init
```

### View Database (requires SQLite CLI)
```bash
cd server
sqlite3 database.sqlite
```

Common SQLite queries:
```sql
-- View all users
SELECT * FROM users;

-- View all matches
SELECT * FROM matches;

-- View all messages
SELECT * FROM messages;

-- Count users
SELECT COUNT(*) FROM users;

-- Exit SQLite
.exit
```

## 🏗️ Build Commands

### Build Backend
```bash
cd server
npm run build
```
Output: `server/dist/`

### Build Frontend
```bash
cd client
npm run build
```
Output: `client/dist/`

### Preview Production Build
```bash
cd client
npm run preview
```

## 🧹 Cleanup Commands

### Clear Dependencies
```bash
# Server
cd server
rm -rf node_modules package-lock.json
npm install

# Client
cd client
rm -rf node_modules package-lock.json
npm install
```

### Clear Build Artifacts
```bash
# Server
cd server
rm -rf dist

# Client
cd client
rm -rf dist
```

### Full Reset (Nuclear Option)
```bash
# From project root
rm -rf server/node_modules server/package-lock.json server/dist server/database.sqlite
rm -rf client/node_modules client/package-lock.json client/dist

# Then reinstall
cd server && npm install && npm run db:init
cd ../client && npm install
```

## 🔍 Development Tools

### Check for TypeScript Errors

**Server:**
```bash
cd server
npx tsc --noEmit
```

**Client:**
```bash
cd client
npx tsc --noEmit
```

### Lint Code

**Client:**
```bash
cd client
npm run lint
```

### Check Node Version
```bash
node --version
# Should be 18.x or higher
```

### Check npm Version
```bash
npm --version
```

## 📝 Useful Database Queries

### Create a New User (via SQL)
```bash
cd server
sqlite3 database.sqlite
```

```sql
INSERT INTO users (email, password_hash, name, age, gender, bio, location, photos, interested_in)
VALUES (
  'newuser@example.com',
  '$2b$10$YourHashedPasswordHere',
  'New User',
  25,
  'female',
  'I love winter!',
  'New York, NY',
  '[]',
  '["male", "female"]'
);
```

### View Recent Messages
```sql
SELECT 
  m.content,
  u.name as sender,
  m.created_at
FROM messages m
JOIN users u ON m.sender_id = u.id
ORDER BY m.created_at DESC
LIMIT 10;
```

### View All Matches with User Info
```sql
SELECT 
  m.id,
  u1.name as user1,
  u2.name as user2,
  m.created_at
FROM matches m
JOIN users u1 ON m.user1_id = u1.id
JOIN users u2 ON m.user2_id = u2.id;
```

### Clear All Swipes (for testing)
```sql
DELETE FROM swipes;
```

### Clear All Matches (for testing)
```sql
DELETE FROM matches;
DELETE FROM messages;
```

## 🐛 Troubleshooting Commands

### Kill Process on Port

**macOS/Linux:**
```bash
# Find process on port 3001
lsof -ti:3001

# Kill it
kill -9 $(lsof -ti:3001)

# Or for port 5173
kill -9 $(lsof -ti:5173)
```

**Windows:**
```cmd
# Find process on port 3001
netstat -ano | findstr :3001

# Kill it (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Check if Ports are in Use

**macOS/Linux:**
```bash
lsof -i :3001
lsof -i :5173
```

**Windows:**
```cmd
netstat -ano | findstr :3001
netstat -ano | findstr :5173
```

### View Server Logs
The server logs appear in the terminal where you run `npm run dev`. Look for:
- Connection messages
- API requests
- Socket.io events
- Errors

### View Client Logs
Open browser DevTools (F12):
- Console tab: JavaScript errors and logs
- Network tab: API requests and responses
- Application tab: localStorage (JWT token)

## 🔧 Configuration

### Change Backend Port
Edit `server/.env` or `server/src/config/index.ts`:
```typescript
port: parseInt(process.env.PORT || '3001', 10)
```

### Change Frontend Port
Edit `client/vite.config.ts`:
```typescript
server: {
  port: 5173,
  // ...
}
```

### Change Database Location
Edit `server/.env` or `server/src/config/index.ts`:
```typescript
databasePath: process.env.DATABASE_PATH || './database.sqlite'
```

## 📚 Package Updates

### Check for Outdated Packages
```bash
cd server
npm outdated

cd ../client
npm outdated
```

### Update Packages (Carefully!)
```bash
# Update to latest within version ranges
npm update

# Or update specific package
npm update package-name

# Check for major updates (breaking changes)
npx npm-check-updates
```

## 🎯 Testing Commands

### Test API Endpoints (using curl)

**Health Check:**
```bash
curl http://localhost:3001/api/health
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

**Get Current User (replace TOKEN):**
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 💡 Pro Tips

1. **Use two terminal windows** - one for server, one for client
2. **Keep DevTools open** - helps catch errors early  
3. **Check both terminals** - errors can appear in either
4. **Clear browser cache** - if things seem broken after updates
5. **Use sample accounts** - alice@example.com, bob@example.com, etc.
6. **Test with multiple browsers** - simulate different users
7. **Open incognito windows** - test multiple users simultaneously

## 📖 More Information

- Full setup guide: `SETUP.md`
- Feature documentation: `FEATURES.md`
- Project overview: `README.md`

---

Need more help? Check the error messages in:
- Server terminal
- Client terminal  
- Browser console (F12)

