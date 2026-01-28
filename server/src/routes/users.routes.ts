import { Router, Response } from 'express';
import { getDatabase } from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get potential matches (users to swipe on)
router.get('/discover', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const userId = req.userId!;

    // Get current user's preferences
    const currentUser = db.prepare(`
      SELECT interested_in, gender, latitude, longitude, age_min, age_max, distance_max FROM users WHERE id = ?
    `).get(userId) as any;

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const interestedIn = JSON.parse(currentUser.interested_in || '[]');
    const ageMin = currentUser.age_min || 18;
    const ageMax = currentUser.age_max || 99;
    const distanceMax = currentUser.distance_max || 50;

    // Get users that match gender preference and haven't been swiped on
    const users = db.prepare(`
      SELECT id, name, age, gender, bio, location, latitude, longitude, photos,
        founder_status, industry, funding_status, company_name, company_stage, role,
        founding_story, biggest_challenge, work_life_balance, ideal_date_night, view_on_exit,
        date_people_who_talk_work, how_destress, coffee_order, hustle_quote
      FROM users
      WHERE id != ?
        AND gender IN (${interestedIn.map(() => '?').join(',')})
        AND age >= ? AND age <= ?
        AND id NOT IN (
          SELECT swiped_id FROM swipes WHERE swiper_id = ?
        )
      ORDER BY RANDOM()
      LIMIT 50
    `).all(userId, ...interestedIn, ageMin, ageMax, userId);

    // Filter by distance if location is available and parse JSON fields
    const parsedUsers = users
      .map((user: any) => {
        const parsedUser = {
          ...user,
          photos: JSON.parse(user.photos || '[]'),
          distance: null as number | null
        };

        // Calculate distance if both users have location
        if (currentUser.latitude && currentUser.longitude && user.latitude && user.longitude) {
          parsedUser.distance = Math.round(
            calculateDistance(currentUser.latitude, currentUser.longitude, user.latitude, user.longitude)
          );
        }

        // Remove latitude/longitude from response for privacy
        delete parsedUser.latitude;
        delete parsedUser.longitude;

        return parsedUser;
      })
      .filter((user: any) => {
        // If distance is calculated, filter by max distance
        if (user.distance !== null) {
          return user.distance <= distanceMax;
        }
        // If no location data, include the user
        return true;
      })
      .slice(0, 20); // Limit to 20 after distance filtering

    res.json(parsedUsers);
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user profile by ID
router.get('/profile/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const user = db.prepare(`
      SELECT id, name, age, gender, bio, location, photos,
        founder_status, industry, funding_status, company_name, company_stage, role,
        founding_story, biggest_challenge, work_life_balance, ideal_date_night, view_on_exit,
        date_people_who_talk_work, how_destress, coffee_order, hustle_quote, created_at
      FROM users WHERE id = ?
    `).get(id) as any;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse JSON fields
    user.photos = JSON.parse(user.photos || '[]');

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update own profile
router.put('/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const userId = req.userId!;
    const { 
      name, age, bio, location, latitude, longitude, photos, interested_in, age_min, age_max, distance_max,
      founder_status, industry, funding_status, company_name, company_stage, role,
      founding_story, biggest_challenge, work_life_balance, ideal_date_night, view_on_exit,
      date_people_who_talk_work, how_destress, coffee_order, hustle_quote
    } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (age !== undefined) {
      updates.push('age = ?');
      values.push(age);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }
    if (latitude !== undefined) {
      updates.push('latitude = ?');
      values.push(latitude);
    }
    if (longitude !== undefined) {
      updates.push('longitude = ?');
      values.push(longitude);
    }
    if (photos !== undefined) {
      updates.push('photos = ?');
      values.push(JSON.stringify(photos));
    }
    if (interested_in !== undefined) {
      updates.push('interested_in = ?');
      values.push(JSON.stringify(interested_in));
    }
    if (age_min !== undefined) {
      updates.push('age_min = ?');
      values.push(age_min);
    }
    if (age_max !== undefined) {
      updates.push('age_max = ?');
      values.push(age_max);
    }
    if (distance_max !== undefined) {
      updates.push('distance_max = ?');
      values.push(distance_max);
    }
    // Founder Journey fields
    if (founder_status !== undefined) {
      updates.push('founder_status = ?');
      values.push(founder_status);
    }
    if (industry !== undefined) {
      updates.push('industry = ?');
      values.push(industry);
    }
    if (funding_status !== undefined) {
      updates.push('funding_status = ?');
      values.push(funding_status);
    }
    if (company_name !== undefined) {
      updates.push('company_name = ?');
      values.push(company_name);
    }
    if (company_stage !== undefined) {
      updates.push('company_stage = ?');
      values.push(company_stage);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (founding_story !== undefined) {
      updates.push('founding_story = ?');
      values.push(founding_story);
    }
    if (biggest_challenge !== undefined) {
      updates.push('biggest_challenge = ?');
      values.push(biggest_challenge);
    }
    // Lifestyle & Compatibility fields
    if (work_life_balance !== undefined) {
      updates.push('work_life_balance = ?');
      values.push(work_life_balance);
    }
    if (ideal_date_night !== undefined) {
      updates.push('ideal_date_night = ?');
      values.push(ideal_date_night);
    }
    if (view_on_exit !== undefined) {
      updates.push('view_on_exit = ?');
      values.push(view_on_exit);
    }
    if (date_people_who_talk_work !== undefined) {
      updates.push('date_people_who_talk_work = ?');
      values.push(date_people_who_talk_work);
    }
    if (how_destress !== undefined) {
      updates.push('how_destress = ?');
      values.push(how_destress);
    }
    if (coffee_order !== undefined) {
      updates.push('coffee_order = ?');
      values.push(coffee_order);
    }
    if (hustle_quote !== undefined) {
      updates.push('hustle_quote = ?');
      values.push(hustle_quote);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    db.prepare(`
      UPDATE users SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    // Get updated user
    const user = db.prepare(`
      SELECT id, email, name, age, gender, bio, location, photos, interested_in, age_min, age_max, distance_max,
        founder_status, industry, funding_status, company_name, company_stage, role,
        founding_story, biggest_challenge, work_life_balance, ideal_date_night, view_on_exit,
        date_people_who_talk_work, how_destress, coffee_order, hustle_quote, created_at, updated_at
      FROM users WHERE id = ?
    `).get(userId) as any;

    user.photos = JSON.parse(user.photos || '[]');
    user.interested_in = JSON.parse(user.interested_in || '[]');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// User stats (matches, views, likes)
router.get('/stats', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const userId = req.userId!;

    const matches = db.prepare(
      `SELECT COUNT(*) as count FROM matches WHERE user1_id = ? OR user2_id = ?`
    ).get(userId, userId) as { count: number };

    const profileViews = db.prepare(
      `SELECT COUNT(*) as count FROM swipes WHERE swiped_id = ?`
    ).get(userId) as { count: number };

    const likes = db.prepare(
      `SELECT COUNT(*) as count FROM swipes WHERE swiper_id = ? AND direction = 'right'`
    ).get(userId) as { count: number };

    res.json({
      matches: matches?.count || 0,
      profileViews: profileViews?.count || 0,
      likes: likes?.count || 0,
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;

