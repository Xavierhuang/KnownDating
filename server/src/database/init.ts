import { getDatabase } from './db';
import bcrypt from 'bcrypt';

/**
 * Initialize database with sample users for development
 */
async function initDatabase() {
  const db = getDatabase();
  
  console.log('Initializing database...');
  
  // Check if we already have users
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count > 0) {
    console.log(`Database already has ${userCount.count} users. Skipping seed.`);
    return;
  }
  
  // Create sample users
  const sampleUsers = [
    {
      email: 'alice@example.com',
      password: 'password123',
      name: 'Alice',
      age: 25,
      gender: 'female',
      bio: 'Love hiking, coffee, and cozy winter nights. Looking for someone to share adventures with!',
      location: 'New York, NY',
      photos: JSON.stringify(['/images/alice.jpg']),
      interested_in: JSON.stringify(['male', 'female'])
    },
    {
      email: 'bob@example.com',
      password: 'password123',
      name: 'Bob',
      age: 28,
      gender: 'male',
      bio: 'Software engineer who loves trying new restaurants and watching movies. Ready to connect!',
      location: 'Brooklyn, NY',
      photos: JSON.stringify(['/images/bob.jpg']),
      interested_in: JSON.stringify(['female'])
    },
    {
      email: 'charlie@example.com',
      password: 'password123',
      name: 'Charlie',
      age: 26,
      gender: 'non-binary',
      bio: 'Artist and musician. Looking for someone creative to spend the cold months with.',
      location: 'Manhattan, NY',
      photos: JSON.stringify(['/images/charlie.jpg']),
      interested_in: JSON.stringify(['male', 'female', 'non-binary'])
    },
    {
      email: 'diana@example.com',
      password: 'password123',
      name: 'Diana',
      age: 24,
      gender: 'female',
      bio: 'Yoga instructor by day, bookworm by night. Let\'s cuddle up with hot chocolate!',
      location: 'Queens, NY',
      photos: JSON.stringify(['/images/diana.jpg']),
      interested_in: JSON.stringify(['male'])
    },
    {
      email: 'evan@example.com',
      password: 'password123',
      name: 'Evan',
      age: 30,
      gender: 'male',
      bio: 'Chef who loves cooking for two. Looking for a partner in crime this winter.',
      location: 'New York, NY',
      photos: JSON.stringify(['/images/evan.jpg']),
      interested_in: JSON.stringify(['female'])
    },
    {
      email: 'frank@example.com',
      password: 'password123',
      name: 'Frank',
      age: 29,
      gender: 'male',
      bio: 'Photographer exploring the city. Looking for someone to adventure with this season.',
      location: 'Manhattan, NY',
      photos: JSON.stringify(['/images/bob.jpg']),
      interested_in: JSON.stringify(['female', 'non-binary'])
    },
    {
      email: 'grace@example.com',
      password: 'password123',
      name: 'Grace',
      age: 27,
      gender: 'female',
      bio: 'Marketing professional who loves brunch and weekend getaways. Ready for cozy dates!',
      location: 'Brooklyn, NY',
      photos: JSON.stringify(['/images/alice.jpg']),
      interested_in: JSON.stringify(['male'])
    },
    {
      email: 'henry@example.com',
      password: 'password123',
      name: 'Henry',
      age: 32,
      gender: 'male',
      bio: 'Teacher and coffee enthusiast. Looking for meaningful connections.',
      location: 'Queens, NY',
      photos: JSON.stringify(['/images/evan.jpg']),
      interested_in: JSON.stringify(['female'])
    },
    {
      email: 'isabella@example.com',
      password: 'password123',
      name: 'Isabella',
      age: 23,
      gender: 'female',
      bio: 'Fashion designer with a passion for art. Let\'s explore galleries and cafes together!',
      location: 'Manhattan, NY',
      photos: JSON.stringify(['/images/diana.jpg']),
      interested_in: JSON.stringify(['male', 'female'])
    },
    {
      email: 'jack@example.com',
      password: 'password123',
      name: 'Jack',
      age: 31,
      gender: 'male',
      bio: 'Writer working on my next novel. Coffee shop regular and lover of deep conversations.',
      location: 'Brooklyn, NY',
      photos: JSON.stringify(['/images/bob.jpg']),
      interested_in: JSON.stringify(['female'])
    },
    {
      email: 'kate@example.com',
      password: 'password123',
      name: 'Kate',
      age: 26,
      gender: 'female',
      bio: 'Nurse by day, baker by night. Looking for someone who appreciates homemade treats!',
      location: 'New York, NY',
      photos: JSON.stringify(['/images/alice.jpg']),
      interested_in: JSON.stringify(['male', 'non-binary'])
    },
    {
      email: 'liam@example.com',
      password: 'password123',
      name: 'Liam',
      age: 28,
      gender: 'male',
      bio: 'Fitness trainer and outdoor enthusiast. Let\'s stay active together this winter!',
      location: 'Queens, NY',
      photos: JSON.stringify(['/images/evan.jpg']),
      interested_in: JSON.stringify(['female'])
    },
    {
      email: 'mia@example.com',
      password: 'password123',
      name: 'Mia',
      age: 25,
      gender: 'female',
      bio: 'Graphic designer and plant mom. Looking for someone to share cozy nights in with.',
      location: 'Brooklyn, NY',
      photos: JSON.stringify(['/images/diana.jpg']),
      interested_in: JSON.stringify(['male', 'female'])
    },
    {
      email: 'noah@example.com',
      password: 'password123',
      name: 'Noah',
      age: 29,
      gender: 'male',
      bio: 'Musician and vinyl collector. Always down for a good concert or record shop crawl.',
      location: 'Manhattan, NY',
      photos: JSON.stringify(['/images/bob.jpg']),
      interested_in: JSON.stringify(['female', 'non-binary'])
    },
    {
      email: 'olivia@example.com',
      password: 'password123',
      name: 'Olivia',
      age: 24,
      gender: 'female',
      bio: 'Law student who loves wine and board games. Seeking intellectual conversations and fun!',
      location: 'New York, NY',
      photos: JSON.stringify(['/images/alice.jpg']),
      interested_in: JSON.stringify(['male'])
    },
    {
      email: 'peter@example.com',
      password: 'password123',
      name: 'Peter',
      age: 33,
      gender: 'male',
      bio: 'Architect designing the future. Passionate about good food and great company.',
      location: 'Brooklyn, NY',
      photos: JSON.stringify(['/images/evan.jpg']),
      interested_in: JSON.stringify(['female'])
    },
    {
      email: 'quinn@example.com',
      password: 'password123',
      name: 'Quinn',
      age: 27,
      gender: 'non-binary',
      bio: 'Writer and podcast host. Looking for someone who appreciates good storytelling.',
      location: 'Manhattan, NY',
      photos: JSON.stringify(['/images/charlie.jpg']),
      interested_in: JSON.stringify(['male', 'female', 'non-binary'])
    },
    {
      email: 'ruby@example.com',
      password: 'password123',
      name: 'Ruby',
      age: 26,
      gender: 'female',
      bio: 'Dancer and choreographer. Let\'s move together!',
      location: 'Queens, NY',
      photos: JSON.stringify(['/images/diana.jpg']),
      interested_in: JSON.stringify(['male', 'female'])
    },
    {
      email: 'sam@example.com',
      password: 'password123',
      name: 'Sam',
      age: 30,
      gender: 'male',
      bio: 'Tech entrepreneur building cool things. Coffee addict and adventure seeker.',
      location: 'New York, NY',
      photos: JSON.stringify(['/images/bob.jpg']),
      interested_in: JSON.stringify(['female'])
    },
    {
      email: 'taylor@example.com',
      password: 'password123',
      name: 'Taylor',
      age: 28,
      gender: 'female',
      bio: 'Social worker making a difference. Love hiking, reading, and meaningful conversations.',
      location: 'Brooklyn, NY',
      photos: JSON.stringify(['/images/alice.jpg']),
      interested_in: JSON.stringify(['male', 'non-binary'])
    }
  ];
  
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, name, age, gender, bio, location, photos, interested_in)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const userIds: number[] = [];
  for (const user of sampleUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const result = insertUser.run(
      user.email,
      passwordHash,
      user.name,
      user.age,
      user.gender,
      user.bio,
      user.location,
      user.photos,
      user.interested_in
    );
    userIds.push(Number(result.lastInsertRowid));
  }
  
  console.log(`✓ Created ${sampleUsers.length} sample users`);
  
  // Create some matches (mutual right swipes)
  const insertMatch = db.prepare(`
    INSERT INTO matches (user1_id, user2_id)
    VALUES (?, ?)
  `);
  
  const insertSwipe = db.prepare(`
    INSERT INTO swipes (swiper_id, swiped_id, direction)
    VALUES (?, ?, ?)
  `);
  
  // Create matches: Alice-Bob, Diana-Evan, Grace-Henry, Isabella-Jack, Kate-Liam
  const matches = [
    [0, 1], // Alice-Bob
    [3, 4], // Diana-Evan
    [6, 7], // Grace-Henry
    [8, 9], // Isabella-Jack
    [10, 11], // Kate-Liam
  ];
  
  for (const [idx1, idx2] of matches) {
    const user1Id = userIds[idx1];
    const user2Id = userIds[idx2];
    
    // Create swipes (both swiped right)
    insertSwipe.run(user1Id, user2Id, 'right');
    insertSwipe.run(user2Id, user1Id, 'right');
    
    // Create match
    insertMatch.run(user1Id, user2Id);
  }
  
  console.log(`✓ Created ${matches.length} matches`);
  
  // Create some messages in existing matches
  const getMatches = db.prepare(`
    SELECT id, user1_id, user2_id FROM matches
  `).all() as Array<{ id: number; user1_id: number; user2_id: number }>;
  
  const insertMessage = db.prepare(`
    INSERT INTO messages (match_id, sender_id, content, created_at)
    VALUES (?, ?, ?, datetime('now', '-' || ? || ' minutes'))
  `);
  
  const sampleMessages = [
    { matchIdx: 0, fromUser1: true, content: "Hey! How's it going? I loved your profile!", delay: 60 },
    { matchIdx: 0, fromUser1: false, content: "Thanks! Same here - love hiking too! Want to grab coffee sometime?", delay: 45 },
    { matchIdx: 0, fromUser1: true, content: "I'd love that! How about this weekend?", delay: 30 },
    { matchIdx: 1, fromUser1: true, content: "Hi! Your cooking sounds amazing!", delay: 120 },
    { matchIdx: 1, fromUser1: false, content: "Thank you! I'd love to cook for you sometime!", delay: 90 },
    { matchIdx: 2, fromUser1: true, content: "Hey! Ready for brunch this weekend?", delay: 180 },
    { matchIdx: 2, fromUser1: false, content: "Absolutely! I know a great spot!", delay: 150 },
    { matchIdx: 3, fromUser1: true, content: "Hi! I'd love to check out some galleries together!", delay: 200 },
    { matchIdx: 4, fromUser1: true, content: "Hey! I just baked some cookies - want some?", delay: 240 },
    { matchIdx: 4, fromUser1: false, content: "That sounds amazing! Yes please!", delay: 210 },
  ];
  
  for (const msg of sampleMessages) {
    const match = getMatches[msg.matchIdx];
    if (!match) continue;
    
    const senderId = msg.fromUser1 ? match.user1_id : match.user2_id;
    insertMessage.run(match.id, senderId, msg.content, msg.delay);
  }
  
  console.log(`✓ Created ${sampleMessages.length} sample messages`);
  
  // Create some additional swipes (left and right) for more variety
  const additionalSwipes = [
    { swiperIdx: 0, swipedIdx: 6, direction: 'right' }, // Alice swipes right on Grace
    { swiperIdx: 0, swipedIdx: 8, direction: 'right' }, // Alice swipes right on Isabella
    { swiperIdx: 0, swipedIdx: 10, direction: 'left' }, // Alice swipes left on Kate
    { swiperIdx: 1, swipedIdx: 3, direction: 'right' }, // Bob swipes right on Diana
    { swiperIdx: 1, swipedIdx: 6, direction: 'right' }, // Bob swipes right on Grace
    { swiperIdx: 1, swipedIdx: 8, direction: 'left' }, // Bob swipes left on Isabella
    { swiperIdx: 2, swipedIdx: 7, direction: 'right' }, // Charlie swipes right on Henry
    { swiperIdx: 2, swipedIdx: 9, direction: 'right' }, // Charlie swipes right on Jack
    { swiperIdx: 4, swipedIdx: 6, direction: 'right' }, // Evan swipes right on Grace
    { swiperIdx: 4, swipedIdx: 8, direction: 'right' }, // Evan swipes right on Isabella
    { swiperIdx: 5, swipedIdx: 1, direction: 'right' }, // Frank swipes right on Bob
    { swiperIdx: 6, swipedIdx: 4, direction: 'right' }, // Grace swipes right on Evan
    { swiperIdx: 7, swipedIdx: 3, direction: 'right' }, // Henry swipes right on Diana
    { swiperIdx: 8, swipedIdx: 1, direction: 'left' }, // Isabella swipes left on Bob
    { swiperIdx: 9, swipedIdx: 3, direction: 'right' }, // Jack swipes right on Diana
    { swiperIdx: 10, swipedIdx: 11, direction: 'right' }, // Kate swipes right on Liam
    { swiperIdx: 12, swipedIdx: 2, direction: 'right' }, // Mia swipes right on Charlie
    { swiperIdx: 13, swipedIdx: 6, direction: 'right' }, // Noah swipes right on Grace
  ];
  
  for (const swipe of additionalSwipes) {
    try {
      insertSwipe.run(userIds[swipe.swiperIdx], userIds[swipe.swipedIdx], swipe.direction);
    } catch (e) {
      // Skip if swipe already exists (e.g., from a match)
    }
  }
  
  console.log(`✓ Created ${additionalSwipes.length} additional swipes`);
  console.log('Database initialization complete!');
}

initDatabase().catch(console.error);

