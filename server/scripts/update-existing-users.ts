import bcrypt from 'bcrypt';
// Try to import from dist (production) first, then src (development)
let getDatabase: any;
try {
  getDatabase = require('../dist/database/db').getDatabase;
} catch {
  getDatabase = require('../src/database/db').getDatabase;
}

async function updateExistingUsers() {
  const db = getDatabase();
  
  // Get all users that might need updating (users with minimal data)
  const users = db.prepare(`
    SELECT id, email, name, bio, founder_status, founding_story 
    FROM users 
    WHERE founder_status IS NULL OR founding_story IS NULL OR founding_story = ''
  `).all() as any[];

  console.log(`Found ${users.length} users that might need updating...\n`);

  const sampleProfiles = [
    {
      founder_status: 'current-founder',
      industry: 'tech',
      funding_status: 'seed',
      company_name: 'InnovateLab',
      company_stage: 'early-stage',
      role: 'Founder & CEO',
      founding_story: 'Started this company to solve a problem I faced in my previous role. We\'re building tools that make work more efficient and enjoyable.',
      biggest_challenge: 'Finding product-market fit while bootstrapping',
      work_life_balance: 'balanced',
      ideal_date_night: 'fancy-dinner',
      view_on_exit: 'exit-when-right',
      date_people_who_talk_work: 'yes-absolutely',
      how_destress: 'Running, reading, and spending time with friends. I love trying new restaurants.',
      coffee_order: 'Cortado, no sugar',
      hustle_quote: 'The only way to do great work is to love what you do.'
    },
    {
      founder_status: 'aspiring-founder',
      industry: 'saas',
      funding_status: null,
      company_name: null,
      company_stage: null,
      role: 'Product Manager',
      founding_story: 'Planning to launch my own SaaS product. Currently validating the idea and looking for a co-founder.',
      biggest_challenge: 'Balancing my day job with building my startup on the side',
      work_life_balance: 'mostly-work',
      ideal_date_night: 'networking-event',
      view_on_exit: 'build-to-last',
      date_people_who_talk_work: 'sometimes',
      how_destress: 'Yoga and meditation. I also love cooking on weekends.',
      coffee_order: 'Oat milk latte',
      hustle_quote: 'The future belongs to those who believe in the beauty of their dreams.'
    },
    {
      founder_status: 'current-founder',
      industry: 'fintech',
      funding_status: 'pre-seed',
      company_name: 'PayStream',
      company_stage: 'early-stage',
      role: 'Co-founder & CTO',
      founding_story: 'Built this company with my co-founder after seeing how difficult payment processing was for small businesses.',
      biggest_challenge: 'Navigating financial regulations while moving fast',
      work_life_balance: 'mostly-work',
      ideal_date_night: 'fancy-dinner',
      view_on_exit: 'exit-when-right',
      date_people_who_talk_work: 'yes-absolutely',
      how_destress: 'Weightlifting and playing guitar. Music helps me unwind.',
      coffee_order: 'Double espresso',
      hustle_quote: 'Innovation distinguishes between a leader and a follower.'
    },
    {
      founder_status: 'serial-founder',
      industry: 'ecommerce',
      funding_status: 'series-a',
      company_name: 'StyleHub',
      company_stage: 'growth-stage',
      role: 'Founder & CEO',
      founding_story: 'This is my second venture. My first company was acquired, and I\'m building something even bigger now.',
      biggest_challenge: 'Scaling operations while maintaining quality and company culture',
      work_life_balance: 'all-work',
      ideal_date_night: 'adventure',
      view_on_exit: 'exit-when-right',
      date_people_who_talk_work: 'yes-absolutely',
      how_destress: 'Traveling and exploring new cities. I love discovering hidden gems.',
      coffee_order: 'Cold brew, black',
      hustle_quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.'
    }
  ];

  let updated = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      // Skip test users we just added
      if (user.email?.includes('@test.com')) {
        console.log(`Skipping test user: ${user.name} (${user.email})`);
        skipped++;
        continue;
      }

      // Pick a random profile template
      const template = sampleProfiles[Math.floor(Math.random() * sampleProfiles.length)];

      // Only update if fields are missing
      const updates: string[] = [];
      const values: any[] = [];

      if (!user.founder_status) {
        updates.push('founder_status = ?');
        values.push(template.founder_status);
      }
      if (!user.industry) {
        updates.push('industry = ?');
        values.push(template.industry);
      }
      if (template.funding_status && !db.prepare('SELECT funding_status FROM users WHERE id = ?').get(user.id)?.funding_status) {
        updates.push('funding_status = ?');
        values.push(template.funding_status);
      }
      if (template.company_name && !db.prepare('SELECT company_name FROM users WHERE id = ?').get(user.id)?.company_name) {
        updates.push('company_name = ?');
        values.push(template.company_name);
      }
      if (template.company_stage && !db.prepare('SELECT company_stage FROM users WHERE id = ?').get(user.id)?.company_stage) {
        updates.push('company_stage = ?');
        values.push(template.company_stage);
      }
      if (!user.role) {
        updates.push('role = ?');
        values.push(template.role);
      }
      if (!user.founding_story || user.founding_story === '') {
        updates.push('founding_story = ?');
        values.push(template.founding_story);
      }

      // Add other fields if they're missing
      const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as any;
      
      if (!currentUser.biggest_challenge) {
        updates.push('biggest_challenge = ?');
        values.push(template.biggest_challenge);
      }
      if (!currentUser.work_life_balance) {
        updates.push('work_life_balance = ?');
        values.push(template.work_life_balance);
      }
      if (!currentUser.ideal_date_night) {
        updates.push('ideal_date_night = ?');
        values.push(template.ideal_date_night);
      }
      if (!currentUser.view_on_exit) {
        updates.push('view_on_exit = ?');
        values.push(template.view_on_exit);
      }
      if (!currentUser.date_people_who_talk_work) {
        updates.push('date_people_who_talk_work = ?');
        values.push(template.date_people_who_talk_work);
      }
      if (!currentUser.how_destress) {
        updates.push('how_destress = ?');
        values.push(template.how_destress);
      }
      if (!currentUser.coffee_order) {
        updates.push('coffee_order = ?');
        values.push(template.coffee_order);
      }
      if (!currentUser.hustle_quote) {
        updates.push('hustle_quote = ?');
        values.push(template.hustle_quote);
      }

      if (updates.length > 0) {
        values.push(user.id);
        db.prepare(`
          UPDATE users 
          SET ${updates.join(', ')}
          WHERE id = ?
        `).run(...values);
        
        console.log(`✓ Updated: ${user.name} (${user.email}) - Added ${updates.length} fields`);
        updated++;
      } else {
        console.log(`- Skipped: ${user.name} (${user.email}) - Already has data`);
        skipped++;
      }
    } catch (error: any) {
      console.error(`✗ Error updating user ${user.email}:`, error.message);
    }
  }

  console.log(`\n✅ Update complete!`);
  console.log(`   Updated: ${updated} users`);
  console.log(`   Skipped: ${skipped} users`);
}

// Run the script
updateExistingUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

