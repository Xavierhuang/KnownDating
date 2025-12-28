// Try to import from dist (production) first, then src (development)
let getDatabase: any;
try {
  getDatabase = require('../dist/database/db').getDatabase;
} catch {
  getDatabase = require('../src/database/db').getDatabase;
}

async function createSarahMatches() {
  const db = getDatabase();
  
  console.log('Creating matches for Sarah...\n');
  
  // Find Sarah's user ID
  const sarah = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get('sarah@test.com') as any;
  
  if (!sarah) {
    console.error('❌ Sarah not found! Make sure seed data has been run.');
    process.exit(1);
  }
  
  console.log(`✓ Found Sarah: ${sarah.name} (ID: ${sarah.id})\n`);
  
  // Find other test users to match with
  const otherUsers = db.prepare(`
    SELECT id, name, email 
    FROM users 
    WHERE email != ? 
    AND email LIKE '%@test.com'
    ORDER BY id
    LIMIT 3
  `).all(sarah.email) as any[];
  
  if (otherUsers.length === 0) {
    console.error('❌ No other test users found! Make sure seed data has been run.');
    process.exit(1);
  }
  
  console.log(`Found ${otherUsers.length} users to match with:\n`);
  
  const matches = [];
  
  for (const user of otherUsers) {
    try {
      // Check if match already exists
      const existingMatch = db.prepare(`
        SELECT id FROM matches 
        WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
      `).get(sarah.id, user.id, user.id, sarah.id);
      
      if (existingMatch) {
        console.log(`- ${user.name} (${user.email}): Match already exists`);
        matches.push({ matchId: existingMatch.id, userName: user.name });
        continue;
      }
      
      // Create match (user1_id should be smaller for consistency)
      const user1Id = sarah.id < user.id ? sarah.id : user.id;
      const user2Id = sarah.id < user.id ? user.id : sarah.id;
      
      const result = db.prepare(`
        INSERT INTO matches (user1_id, user2_id, created_at)
        VALUES (?, ?, datetime('now'))
      `).run(user1Id, user2Id);
      
      const matchId = result.lastInsertRowid as number;
      
      console.log(`✓ Created match with ${user.name} (${user.email}) - Match ID: ${matchId}`);
      matches.push({ matchId, userName: user.name, userId: user.id });
      
      // Create swipes so the match makes sense
      // Sarah swiped right on the other user
      db.prepare(`
        INSERT OR IGNORE INTO swipes (swiper_id, swiped_id, direction, created_at)
        VALUES (?, ?, 'right', datetime('now'))
      `).run(sarah.id, user.id);
      
      // Other user swiped right on Sarah
      db.prepare(`
        INSERT OR IGNORE INTO swipes (swiper_id, swiped_id, direction, created_at)
        VALUES (?, ?, 'right', datetime('now'))
      `).run(user.id, sarah.id);
      
    } catch (error: any) {
      console.error(`✗ Error creating match with ${user.name}:`, error.message);
    }
  }
  
  console.log('\n📨 Creating sample messages...\n');
  
  // Create sample messages for each match
  const sampleMessages = [
    {
      fromSarah: "Hey! I saw you're building something in fintech - that's awesome! How's it going?",
      fromOther: "Thanks! It's been quite a journey. I saw you're working on MindfulSpace - mental health accessibility is so important. How did you get started?"
    },
    {
      fromSarah: "Hi there! Love your hustle quote - really resonates with me. What's the biggest challenge you're facing right now?",
      fromOther: "Hey Sarah! Thanks for reaching out. Right now it's all about scaling while maintaining quality. What about you?"
    },
    {
      fromSarah: "Hey! I noticed we're both in the early-stage phase. Would love to connect and share experiences!",
      fromOther: "Absolutely! It's always great to connect with fellow founders. What's been your biggest learning so far?"
    }
  ];
  
  for (let i = 0; i < matches.length && i < sampleMessages.length; i++) {
    const match = matches[i];
    const messages = sampleMessages[i];
    
    if (!match.matchId || !match.userId) continue;
    
    try {
      // Sarah sends first message
      db.prepare(`
        INSERT INTO messages (match_id, sender_id, content, created_at, read)
        VALUES (?, ?, ?, datetime('now', '-2 hours'), 0)
      `).run(match.matchId, sarah.id, messages.fromSarah);
      
      // Other user responds
      db.prepare(`
        INSERT INTO messages (match_id, sender_id, content, created_at, read)
        VALUES (?, ?, ?, datetime('now', '-1 hour'), 0)
      `).run(match.matchId, match.userId, messages.fromOther);
      
      // Sarah responds again
      db.prepare(`
        INSERT INTO messages (match_id, sender_id, content, created_at, read)
        VALUES (?, ?, ?, datetime('now', '-30 minutes'), 0)
      `).run(match.matchId, sarah.id, "That sounds challenging but exciting! Would love to grab coffee and chat more about it. Are you free this week?");
      
      console.log(`✓ Created 3 sample messages for match with ${match.userName}`);
    } catch (error: any) {
      console.error(`✗ Error creating messages for ${match.userName}:`, error.message);
    }
  }
  
  console.log('\n✅ Done! Sarah now has:');
  console.log(`   - ${matches.length} matches`);
  console.log(`   - Sample conversations in each match`);
  console.log(`\nSarah can now test the chat feature with:`);
  matches.forEach(match => {
    console.log(`   - ${match.userName}`);
  });
}

// Run the script
createSarahMatches()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

