import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/db';
import { config } from '../config';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { 
      email, password, name, age, gender, bio, location, interested_in, terms_accepted,
      // Founder Journey fields (Step 2)
      founder_status, industry, funding_status, company_name, company_stage, role,
      founding_story, biggest_challenge,
      // Lifestyle & Compatibility fields (Step 3)
      work_life_balance, ideal_date_night, view_on_exit, date_people_who_talk_work,
      how_destress, coffee_order, hustle_quote
    } = req.body;

    // Validation
    if (!email || !password || !name || !age || !gender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Require Terms acceptance (Apple Guideline 1.2)
    if (!terms_accepted) {
      return res.status(400).json({ error: 'You must accept the Terms of Service to create an account' });
    }

    const db = getDatabase();

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with all fields
    const result = db.prepare(`
      INSERT INTO users (
        email, password_hash, name, age, gender, bio, location, photos, interested_in,
        founder_status, industry, funding_status, company_name, company_stage, role,
        founding_story, biggest_challenge, work_life_balance, ideal_date_night, view_on_exit,
        date_people_who_talk_work, how_destress, coffee_order, hustle_quote,
        terms_accepted, terms_accepted_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      email,
      passwordHash,
      name,
      age,
      gender,
      bio || null,
      location || null,
      JSON.stringify([]),
      JSON.stringify(interested_in || ['male', 'female', 'non-binary']),
      founder_status || null,
      industry || null,
      funding_status || null,
      company_name || null,
      company_stage || null,
      role || null,
      founding_story || null,
      biggest_challenge || null,
      work_life_balance || null,
      ideal_date_night || null,
      view_on_exit || null,
      date_people_who_talk_work || null,
      how_destress || null,
      coffee_order || null,
      hustle_quote || null,
      1 // terms_accepted = true
    );

    const userId = result.lastInsertRowid;

    // Generate JWT
    const token = jwt.sign({ userId }, config.jwtSecret, { expiresIn: '7d' });

    // Get user data with all fields
    const user = db.prepare(`
      SELECT id, email, name, age, gender, bio, location, photos, interested_in, age_min, age_max, distance_max,
        founder_status, industry, funding_status, company_name, company_stage, role,
        founding_story, biggest_challenge, work_life_balance, ideal_date_night, view_on_exit,
        date_people_who_talk_work, how_destress, coffee_order, hustle_quote, created_at
      FROM users WHERE id = ?
    `).get(userId) as any;

    // Parse JSON fields
    user.photos = JSON.parse(user.photos || '[]');
    user.interested_in = JSON.parse(user.interested_in || '[]');

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const db = getDatabase();

    // Get user with password
    const user = db.prepare(`
      SELECT id, email, password_hash, name, age, gender, bio, location, photos, interested_in, age_min, age_max, distance_max,
        founder_status, industry, funding_status, company_name, company_stage, role,
        founding_story, biggest_challenge, work_life_balance, ideal_date_night, view_on_exit,
        date_people_who_talk_work, how_destress, coffee_order, hustle_quote, created_at
      FROM users WHERE email = ?
    `).get(email) as any & { password_hash: string };

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });

    // Remove password from response
    delete user.password_hash;

    // Parse JSON fields
    user.photos = JSON.parse(user.photos || '[]');
    user.interested_in = JSON.parse(user.interested_in || '[]');

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    
    const user = db.prepare(`
      SELECT id, email, name, age, gender, bio, location, photos, interested_in, age_min, age_max, distance_max,
        founder_status, industry, funding_status, company_name, company_stage, role,
        founding_story, biggest_challenge, work_life_balance, ideal_date_night, view_on_exit,
        date_people_who_talk_work, how_destress, coffee_order, hustle_quote, created_at
      FROM users WHERE id = ?
    `).get(req.userId) as any;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse JSON fields
    user.photos = JSON.parse(user.photos || '[]');
    user.interested_in = JSON.parse(user.interested_in || '[]');

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Delete current user
router.delete('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;

