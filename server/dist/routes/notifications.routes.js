"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../database/db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Register device token for push notifications
router.post('/register-token', auth_1.authenticateToken, (req, res) => {
    try {
        const db = (0, db_1.getDatabase)();
        const userId = req.userId;
        const { token, platform } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }
        // Insert or update device token
        db.prepare(`
      INSERT INTO device_tokens (user_id, token, platform)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, token) DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP,
        platform = ?
    `).run(userId, token, platform || 'unknown', platform || 'unknown');
        res.json({ success: true });
    }
    catch (error) {
        console.error('Token registration error:', error);
        res.status(500).json({ error: 'Failed to register token' });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.routes.js.map