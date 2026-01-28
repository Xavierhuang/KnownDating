import { Router, Response } from 'express';
import { getDatabase } from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Swipe on a user
router.post('/swipe', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const userId = req.userId!;
    const { swiped_id, direction } = req.body;

    if (!swiped_id || !direction || !['left', 'right'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid swipe data' });
    }

    // Record the swipe
    db.prepare(`
      INSERT OR IGNORE INTO swipes (swiper_id, swiped_id, direction)
      VALUES (?, ?, ?)
    `).run(userId, swiped_id, direction);

    let match = null;

    // Check for mutual match (both swiped right)
    if (direction === 'right') {
      const mutualSwipe = db.prepare(`
        SELECT id FROM swipes
        WHERE swiper_id = ? AND swiped_id = ? AND direction = 'right'
      `).get(swiped_id, userId);

      if (mutualSwipe) {
        // Create match (ensure user1_id < user2_id for consistency)
        const [user1, user2] = userId < swiped_id ? [userId, swiped_id] : [swiped_id, userId];
        
        const matchResult = db.prepare(`
          INSERT OR IGNORE INTO matches (user1_id, user2_id)
          VALUES (?, ?)
        `).run(user1, user2);

        if (matchResult.changes > 0) {
          // Get match details
          match = db.prepare(`
            SELECT m.id, m.created_at,
                   u.id as user_id, u.name, u.age, u.photos
            FROM matches m
            JOIN users u ON (u.id = ? OR u.id = ?) AND u.id != ?
            WHERE m.id = ?
          `).get(user1, user2, userId, matchResult.lastInsertRowid) as any;

          if (match) {
            match.photos = JSON.parse(match.photos || '[]');
          }
        }
      }
    }

    res.json({ success: true, match });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ error: 'Failed to process swipe' });
  }
});

// Get all matches for current user
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const userId = req.userId!;

    const matches = db.prepare(`
      SELECT 
        m.id,
        m.user1_id,
        m.user2_id,
        m.created_at,
        CASE 
          WHEN m.user1_id = ? THEN u2.id
          ELSE u1.id
        END as user_id,
        CASE 
          WHEN m.user1_id = ? THEN u2.name
          ELSE u1.name
        END as name,
        CASE 
          WHEN m.user1_id = ? THEN u2.age
          ELSE u1.age
        END as age,
        CASE 
          WHEN m.user1_id = ? THEN u2.photos
          ELSE u1.photos
        END as photos,
        (
          SELECT content
          FROM messages
          WHERE match_id = m.id
          ORDER BY created_at DESC
          LIMIT 1
        ) as last_message,
        (
          SELECT created_at
          FROM messages
          WHERE match_id = m.id
          ORDER BY created_at DESC
          LIMIT 1
        ) as last_message_time
      FROM matches m
      JOIN users u1 ON m.user1_id = u1.id
      JOIN users u2 ON m.user2_id = u2.id
      WHERE m.user1_id = ? OR m.user2_id = ?
      ORDER BY m.created_at DESC
    `).all(userId, userId, userId, userId, userId, userId);

    // Parse JSON fields
    const parsedMatches = matches.map((match: any) => ({
      ...match,
      photos: JSON.parse(match.photos || '[]')
    }));

    res.json(parsedMatches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

export default router;

