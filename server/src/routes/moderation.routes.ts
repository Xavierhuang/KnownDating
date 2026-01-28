import { Router, Response } from 'express';
import { getDatabase } from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Report a user
router.post('/report', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const userId = req.userId!;
    const { reported_id, reason, details } = req.body;

    if (!reported_id || !reason) {
      return res.status(400).json({ error: 'Reported user ID and reason are required' });
    }

    if (reported_id === userId) {
      return res.status(400).json({ error: 'Cannot report yourself' });
    }

    // Check if user exists
    const reportedUser = db.prepare('SELECT id FROM users WHERE id = ?').get(reported_id);
    if (!reportedUser) {
      return res.status(404).json({ error: 'Reported user not found' });
    }

    // Insert report
    db.prepare(`
      INSERT INTO reports (reporter_id, reported_id, reason, details, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).run(userId, reported_id, reason, details || null);

    res.status(201).json({ 
      success: true, 
      message: 'Report submitted successfully. Our team will review within 24 hours.' 
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Block a user
router.post('/block', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const userId = req.userId!;
    const { blocked_id } = req.body;

    if (!blocked_id) {
      return res.status(400).json({ error: 'Blocked user ID is required' });
    }

    if (blocked_id === userId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    // Check if user exists
    const blockedUser = db.prepare('SELECT id FROM users WHERE id = ?').get(blocked_id);
    if (!blockedUser) {
      return res.status(404).json({ error: 'User to block not found' });
    }

    // Insert block (or ignore if already blocked)
    try {
      db.prepare(`
        INSERT INTO blocks (blocker_id, blocked_id)
        VALUES (?, ?)
      `).run(userId, blocked_id);
    } catch (error: any) {
      // If already blocked, that's fine
      if (!error.message.includes('UNIQUE constraint')) {
        throw error;
      }
    }

    // Remove any existing matches between these users
    db.prepare(`
      DELETE FROM matches
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `).run(userId, blocked_id, blocked_id, userId);

    res.json({ 
      success: true, 
      message: 'User blocked successfully. You will no longer see their messages or profile.' 
    });
  } catch (error) {
    console.error('Block error:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Unblock a user
router.delete('/block/:blockedId', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const userId = req.userId!;
    const { blockedId } = req.params;

    db.prepare(`
      DELETE FROM blocks
      WHERE blocker_id = ? AND blocked_id = ?
    `).run(userId, blockedId);

    res.json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock error:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// Get list of blocked users
router.get('/blocked', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const userId = req.userId!;

    const blocked = db.prepare(`
      SELECT b.blocked_id, u.name, u.photos
      FROM blocks b
      JOIN users u ON b.blocked_id = u.id
      WHERE b.blocker_id = ?
    `).all(userId) as any[];

    // Parse photos
    const blockedUsers = blocked.map(user => ({
      ...user,
      photos: JSON.parse(user.photos || '[]')
    }));

    res.json(blockedUsers);
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ error: 'Failed to get blocked users' });
  }
});

export default router;

