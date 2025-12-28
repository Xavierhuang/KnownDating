"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../database/db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get messages for a match
router.get('/:matchId', auth_1.authenticateToken, (req, res) => {
    try {
        const db = (0, db_1.getDatabase)();
        const userId = req.userId;
        const { matchId } = req.params;
        // Verify user is part of this match
        const match = db.prepare(`
      SELECT id FROM matches
      WHERE id = ? AND (user1_id = ? OR user2_id = ?)
    `).get(matchId, userId, userId);
        if (!match) {
            return res.status(403).json({ error: 'Access denied' });
        }
        // Get messages
        const messages = db.prepare(`
      SELECT m.id, m.sender_id, m.content, m.created_at, m.read,
             u.name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.match_id = ?
      ORDER BY m.created_at ASC
    `).all(matchId);
        // Mark messages as read
        db.prepare(`
      UPDATE messages
      SET read = 1
      WHERE match_id = ? AND sender_id != ?
    `).run(matchId, userId);
        res.json(messages);
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
});
// Content filtering function (simple profanity filter)
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
    // Check for suspicious patterns (multiple URLs, spam indicators)
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
// Send a message
router.post('/', auth_1.authenticateToken, (req, res) => {
    try {
        const db = (0, db_1.getDatabase)();
        const userId = req.userId;
        const { match_id, content } = req.body;
        if (!match_id || !content || !content.trim()) {
            return res.status(400).json({ error: 'Match ID and content required' });
        }
        // Filter content for objectionable material
        const filterResult = filterContent(content);
        if (filterResult.isBlocked) {
            return res.status(400).json({
                error: filterResult.reason || 'Message contains inappropriate content',
                blocked: true
            });
        }
        // Check if user is blocked by the other user
        const match = db.prepare(`
      SELECT user1_id, user2_id FROM matches
      WHERE id = ? AND (user1_id = ? OR user2_id = ?)
    `).get(match_id, userId, userId);
        if (!match) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
        // Check if blocked
        const isBlocked = db.prepare(`
      SELECT id FROM blocks
      WHERE blocker_id = ? AND blocked_id = ?
    `).get(otherUserId, userId);
        if (isBlocked) {
            return res.status(403).json({ error: 'You have been blocked by this user' });
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
        res.status(201).json(message);
    }
    catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});
exports.default = router;
//# sourceMappingURL=messages.routes.js.map