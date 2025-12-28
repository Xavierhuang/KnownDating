import { Router, Response } from 'express';
import { getDatabase } from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Register device token for push notifications
router.post('/register-token', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const userId = req.userId!;
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
  } catch (error) {
    console.error('Token registration error:', error);
    res.status(500).json({ error: 'Failed to register token' });
  }
});

export default router;




