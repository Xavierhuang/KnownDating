import bcrypt from 'bcrypt';
// Try to import from dist (production) first, then src (development)
let getDatabase: any;
try {
  getDatabase = require('../dist/database/db').getDatabase;
} catch {
  getDatabase = require('../src/database/db').getDatabase;
}

async function addTestData() {
  const db = getDatabase();
  
  // Hash password for all test users
  const testPassword = await bcrypt.hash('test123', 10);
  
  const testUsers = [
    {
      email: 'alex@test.com',
      password_hash: testPassword,
      name: 'Alex Chen',
      age: 28,
      gender: 'male',
      bio: 'Building the future of fintech, one transaction at a time. When I\'m not coding, you\'ll find me at the climbing gym or exploring new coffee shops.',
      location: 'San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop'
      ]),
      interested_in: JSON.stringify(['female', 'non-binary']),
      age_min: 24,
      age_max: 35,
      distance_max: 25,
      founder_status: 'current-founder',
      industry: 'fintech',
      funding_status: 'series-a',
      company_name: 'PayFlow',
      company_stage: 'growth-stage',
      role: 'CEO & Co-founder',
      founding_story: 'Started PayFlow after struggling with payment processing at my first startup. We\'ve now processed over $100M in transactions.',
      biggest_challenge: 'Scaling our team while maintaining our culture and product quality',
      work_life_balance: 'mostly-work',
      ideal_date_night: 'fancy-dinner',
      view_on_exit: 'exit-when-right',
      date_people_who_talk_work: 'yes-absolutely',
      how_destress: 'Rock climbing and weekend hikes. Nothing clears my head like being outdoors.',
      coffee_order: 'Double espresso, no sugar',
      hustle_quote: 'The best time to plant a tree was 20 years ago. The second best time is now.',
      terms_accepted: 1,
      terms_accepted_at: new Date().toISOString()
    },
    {
      email: 'sarah@test.com',
      password_hash: testPassword,
      name: 'Sarah Kim',
      age: 26,
      gender: 'female',
      bio: 'Healthcare entrepreneur passionate about making mental health accessible. Love yoga, meditation, and deep conversations over wine.',
      location: 'New York, NY',
      latitude: 40.7128,
      longitude: -74.0060,
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop'
      ]),
      interested_in: JSON.stringify(['male', 'female']),
      age_min: 24,
      age_max: 32,
      distance_max: 20,
      founder_status: 'current-founder',
      industry: 'healthcare',
      funding_status: 'seed',
      company_name: 'MindfulSpace',
      company_stage: 'early-stage',
      role: 'Founder & CEO',
      founding_story: 'After seeing friends struggle to find affordable therapy, I built MindfulSpace to connect people with licensed therapists at accessible prices.',
      biggest_challenge: 'Navigating healthcare regulations while building fast',
      work_life_balance: 'balanced',
      ideal_date_night: 'cozy-night-in',
      view_on_exit: 'build-to-last',
      date_people_who_talk_work: 'yes-absolutely',
      how_destress: 'Yoga, meditation, and cooking. I make a mean pad thai.',
      coffee_order: 'Oat milk latte with a dash of cinnamon',
      hustle_quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
      terms_accepted: 1,
      terms_accepted_at: new Date().toISOString()
    },
    {
      email: 'marcus@test.com',
      password_hash: testPassword,
      name: 'Marcus Johnson',
      age: 32,
      gender: 'male',
      bio: 'Serial entrepreneur on my third venture. Love building products that matter. When not working, I\'m either at the gym or trying new restaurants.',
      location: 'Austin, TX',
      latitude: 30.2672,
      longitude: -97.7431,
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop'
      ]),
      interested_in: JSON.stringify(['female']),
      age_min: 26,
      age_max: 36,
      distance_max: 30,
      founder_status: 'serial-founder',
      industry: 'saas',
      funding_status: 'series-b+',
      company_name: 'CloudSync',
      company_stage: 'growth-stage',
      role: 'Founder & CEO',
      founding_story: 'Built and sold two companies before 30. CloudSync is my third venture, focused on enterprise collaboration tools.',
      biggest_challenge: 'Managing rapid growth while staying true to our mission',
      work_life_balance: 'all-work',
      ideal_date_night: 'fancy-dinner',
      view_on_exit: 'exit-when-right',
      date_people_who_talk_work: 'yes-absolutely',
      how_destress: 'Weightlifting and cooking. I meal prep every Sunday.',
      coffee_order: 'Black coffee, extra strong',
      hustle_quote: 'The only way to do great work is to love what you do.',
      terms_accepted: 1,
      terms_accepted_at: new Date().toISOString()
    },
    {
      email: 'priya@test.com',
      password_hash: testPassword,
      name: 'Priya Patel',
      age: 29,
      gender: 'female',
      bio: 'E-commerce founder building sustainable fashion. Passionate about ethical business and finding someone who shares my values.',
      location: 'Los Angeles, CA',
      latitude: 34.0522,
      longitude: -118.2437,
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop'
      ]),
      interested_in: JSON.stringify(['male', 'female', 'non-binary']),
      age_min: 27,
      age_max: 35,
      distance_max: 25,
      founder_status: 'current-founder',
      industry: 'ecommerce',
      funding_status: 'bootstrapped',
      company_name: 'EcoThreads',
      company_stage: 'early-stage',
      role: 'Founder & Creative Director',
      founding_story: 'Started EcoThreads after realizing how wasteful fast fashion is. We create beautiful, sustainable clothing that doesn\'t cost the earth.',
      biggest_challenge: 'Competing with fast fashion prices while maintaining ethical standards',
      work_life_balance: 'balanced',
      ideal_date_night: 'adventure',
      view_on_exit: 'build-to-last',
      date_people_who_talk_work: 'sometimes',
      how_destress: 'Yoga, reading, and long walks on the beach. I also love trying new vegan restaurants.',
      coffee_order: 'Matcha latte with oat milk',
      hustle_quote: 'Do what you can, with what you have, where you are.',
      terms_accepted: 1,
      terms_accepted_at: new Date().toISOString()
    },
    {
      email: 'diana@test.com',
      password_hash: testPassword,
      name: 'Diana Martinez',
      age: 24,
      gender: 'female',
      bio: 'Yoga instructor by day, bookworm by night. Let\'s cuddle up with hot chocolate!',
      location: 'Queens, NY',
      latitude: 40.7282,
      longitude: -73.7949,
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop'
      ]),
      interested_in: JSON.stringify(['male', 'female']),
      age_min: 22,
      age_max: 30,
      distance_max: 15,
      founder_status: 'aspiring-founder',
      industry: 'tech',
      funding_status: null,
      company_name: null,
      company_stage: null,
      role: 'Yoga Instructor',
      founding_story: 'Planning to launch a wellness app that connects yoga instructors with students. Still in the ideation phase!',
      biggest_challenge: 'Finding the right co-founder and validating my idea',
      work_life_balance: 'mostly-life',
      ideal_date_night: 'cozy-night-in',
      view_on_exit: 'build-to-last',
      date_people_who_talk_work: 'sometimes',
      how_destress: 'Yoga, reading, and making homemade hot chocolate. I have a secret recipe!',
      coffee_order: 'Chai latte with extra foam',
      hustle_quote: 'The journey of a thousand miles begins with a single step.',
      terms_accepted: 1,
      terms_accepted_at: new Date().toISOString()
    },
    {
      email: 'james@test.com',
      password_hash: testPassword,
      name: 'James Wilson',
      age: 30,
      gender: 'male',
      bio: 'AI researcher turned entrepreneur. Building the next generation of machine learning tools. Love chess, hiking, and deep tech conversations.',
      location: 'Seattle, WA',
      latitude: 47.6062,
      longitude: -122.3321,
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop'
      ]),
      interested_in: JSON.stringify(['female', 'non-binary']),
      age_min: 26,
      age_max: 34,
      distance_max: 30,
      founder_status: 'current-founder',
      industry: 'tech',
      funding_status: 'pre-seed',
      company_name: 'NeuralForge',
      company_stage: 'early-stage',
      role: 'Co-founder & CTO',
      founding_story: 'Left my research position to build NeuralForge. We\'re making AI accessible to small businesses.',
      biggest_challenge: 'Explaining complex AI concepts to non-technical stakeholders',
      work_life_balance: 'mostly-work',
      ideal_date_night: 'networking-event',
      view_on_exit: 'exit-when-right',
      date_people_who_talk_work: 'yes-absolutely',
      how_destress: 'Chess, hiking, and reading research papers. I know, I\'m a nerd.',
      coffee_order: 'Cold brew, black',
      hustle_quote: 'Innovation distinguishes between a leader and a follower.',
      terms_accepted: 1,
      terms_accepted_at: new Date().toISOString()
    }
  ];

  console.log('Adding test users...');
  
  for (const user of testUsers) {
    try {
      // Check if user already exists
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(user.email);
      if (existing) {
        console.log(`User ${user.email} already exists, skipping...`);
        continue;
      }

      // Insert user
      db.prepare(`
        INSERT INTO users (
          email, password_hash, name, age, gender, bio, location, latitude, longitude,
          photos, interested_in, age_min, age_max, distance_max,
          founder_status, industry, funding_status, company_name, company_stage, role,
          founding_story, biggest_challenge, work_life_balance, ideal_date_night,
          view_on_exit, date_people_who_talk_work, how_destress, coffee_order, hustle_quote,
          terms_accepted, terms_accepted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        user.email, user.password_hash, user.name, user.age, user.gender, user.bio,
        user.location, user.latitude, user.longitude, user.photos, user.interested_in,
        user.age_min, user.age_max, user.distance_max,
        user.founder_status, user.industry, user.funding_status, user.company_name,
        user.company_stage, user.role, user.founding_story, user.biggest_challenge,
        user.work_life_balance, user.ideal_date_night, user.view_on_exit,
        user.date_people_who_talk_work, user.how_destress, user.coffee_order,
        user.hustle_quote, user.terms_accepted, user.terms_accepted_at
      );
      
      console.log(`✓ Added user: ${user.name} (${user.email})`);
    } catch (error: any) {
      console.error(`✗ Error adding user ${user.email}:`, error.message);
    }
  }
  
  console.log('\n✅ Test data added successfully!');
  console.log('All test users have password: test123');
}

// Run the script
addTestData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

