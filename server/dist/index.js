"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const config_1 = require("./config");
const db_1 = require("./database/db");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const matches_routes_1 = __importDefault(require("./routes/matches.routes"));
const messages_routes_1 = __importDefault(require("./routes/messages.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const photos_routes_1 = __importDefault(require("./routes/photos.routes"));
const moderation_routes_1 = __importDefault(require("./routes/moderation.routes"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// CORS configuration for production
const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://chatwithgods.com',
    'http://chatwithgods.com',
    'capacitor://localhost',
    'ionic://localhost',
];
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? [
        ...process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
        'capacitor://localhost',
        'ionic://localhost',
    ]
    : defaultOrigins;
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});
exports.io = io;
// Middleware
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express_1.default.json());
// Ensure upload directory exists
if (!fs_1.default.existsSync(config_1.config.uploadDir)) {
    fs_1.default.mkdirSync(config_1.config.uploadDir, { recursive: true });
}
// Serve uploaded files
app.use('/uploads', express_1.default.static(config_1.config.uploadDir));
// Serve static files (support page, etc.)
app.use(express_1.default.static('public'));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/matches', matches_routes_1.default);
app.use('/api/messages', messages_routes_1.default);
app.use('/api/notifications', notifications_routes_1.default);
app.use('/api/photos', photos_routes_1.default);
app.use('/api/moderation', moderation_routes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Support page route
app.get('/support', (req, res) => {
    // Try both development and production paths
    const devPath = path_1.default.join(__dirname, '..', 'public', 'support.html');
    const prodPath = path_1.default.join(process.cwd(), 'public', 'support.html');
    const supportPath = fs_1.default.existsSync(devPath) ? devPath : prodPath;
    if (fs_1.default.existsSync(supportPath)) {
        res.sendFile(supportPath);
    }
    else {
        res.status(404).send('Support page not found');
    }
});
// Socket.io for real-time messaging
const userSockets = new Map(); // userId -> socketId
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        socket.data.userId = decoded.userId;
        next();
    }
    catch (err) {
        next(new Error('Authentication error'));
    }
});
io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`User ${userId} connected`);
    // Store user's socket
    userSockets.set(userId, socket.id);
    // Content filtering function (same as in messages.routes.ts)
    function filterContent(content) {
        const profanityWords = [
            'fuck', 'shit', 'ass', 'bitch', 'damn', 'hell', 'cock', 'pussy', 'nigger',
            'retard', 'retarded', 'idiot', 'stupid', 'moron',
            'kill yourself', 'kys', 'die', 'hate you',
        ];
        const lowerContent = content.toLowerCase();
        for (const word of profanityWords) {
            const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            if (regex.test(lowerContent)) {
                return {
                    filtered: content,
                    isBlocked: true,
                    reason: 'Contains inappropriate language'
                };
            }
        }
        const urlPattern = /(http|https|www\.)/gi;
        const urlMatches = content.match(urlPattern);
        if (urlMatches && urlMatches.length > 1) {
            return {
                filtered: content,
                isBlocked: true,
                reason: 'Contains suspicious links'
            };
        }
        return {
            filtered: content.trim(),
            isBlocked: false
        };
    }
    // Handle new message
    socket.on('send_message', async (data) => {
        try {
            const { match_id, content } = data;
            const db = (0, db_1.getDatabase)();
            // Filter content for objectionable material
            const filterResult = filterContent(content);
            if (filterResult.isBlocked) {
                socket.emit('error', {
                    message: filterResult.reason || 'Message contains inappropriate content',
                    blocked: true
                });
                return;
            }
            // Verify user is part of this match
            const match = db.prepare(`
        SELECT user1_id, user2_id FROM matches
        WHERE id = ? AND (user1_id = ? OR user2_id = ?)
      `).get(match_id, userId, userId);
            if (!match) {
                socket.emit('error', { message: 'Invalid match' });
                return;
            }
            // Check if user is blocked
            const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
            const isBlocked = db.prepare(`
        SELECT id FROM blocks
        WHERE blocker_id = ? AND blocked_id = ?
      `).get(otherUserId, userId);
            if (isBlocked) {
                socket.emit('error', { message: 'You have been blocked by this user' });
                return;
            }
            // Insert message with filtered content
            const result = db.prepare(`
        INSERT INTO messages (match_id, sender_id, content)
        VALUES (?, ?, ?)
      `).run(match_id, userId, filterResult.filtered);
            // Get the created message
            const message = db.prepare(`
        SELECT m.id, m.sender_id, m.content, m.created_at, m.read,
               u.name as sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?
      `).get(result.lastInsertRowid);
            // Send to both users in the match
            const recipientId = match.user1_id === userId ? match.user2_id : match.user1_id;
            const recipientSocketId = userSockets.get(recipientId);
            // Send to sender
            socket.emit('new_message', message);
            // Send to recipient if they're online
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('new_message', message);
            }
        }
        catch (error) {
            console.error('Socket message error:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });
    // Handle match notification
    socket.on('new_match', (data) => {
        const { user_id } = data;
        const recipientSocketId = userSockets.get(user_id);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('match_notification', data);
        }
    });
    // Handle marking messages as read
    socket.on('mark_messages_read', async (data) => {
        try {
            const { match_id } = data;
            const db = (0, db_1.getDatabase)();
            // Update read status for messages in this match
            db.prepare(`
        UPDATE messages
        SET read = 1
        WHERE match_id = ? AND sender_id != ? AND read = 0
      `).run(match_id, userId);
            // Notify sender that their messages were read
            const match = db.prepare(`
        SELECT user1_id, user2_id FROM matches WHERE id = ?
      `).get(match_id);
            if (match) {
                const senderId = match.user1_id === userId ? match.user2_id : match.user1_id;
                const senderSocketId = userSockets.get(senderId);
                if (senderSocketId) {
                    io.to(senderSocketId).emit('messages_read', { match_id, reader_id: userId });
                }
            }
        }
        catch (error) {
            console.error('Mark read error:', error);
        }
    });
    socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
        userSockets.delete(userId);
    });
});
// Initialize database
(0, db_1.getDatabase)();
// Start server
httpServer.listen(config_1.config.port, () => {
    console.log(`Server running on http://localhost:${config_1.config.port}`);
    console.log(`Environment: ${config_1.config.nodeEnv}`);
});
//# sourceMappingURL=index.js.map