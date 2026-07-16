import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'dns';

// Force Node.js to use IPv4 DNS resolution first (fixes SRV querySrv connection bugs)
dns.setDefaultResultOrder('ipv4first');

import User from '../models/User.js';
import Session from '../models/Session.js';
import Message from '../models/Message.js';
import Review from '../models/Review.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected.');

    // Clear existing data
    console.log('Cleaning existing collection data...');
    await User.deleteMany({});
    await Session.deleteMany({});
    await Message.deleteMany({});
    await Review.deleteMany({});

    console.log('Generating password hashes...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    console.log('Creating users...');
    const users = [
      {
        name: 'System Administrator',
        email: 'admin@example.com',
        password: hashedPassword,
        skillsOffered: ['Moderation', 'Platform Support'],
        skillsNeeded: ['User Feedback'],
        bio: 'Official administration account for the SkillSwap peer network.',
        avatar: 'https://ui-avatars.com/api/?name=System+Admin&background=ef4444&color=fff&size=128',
        isAdmin: true,
      },
      {
        name: 'Alice Vance',
        email: 'alice@example.com',
        password: hashedPassword,
        skillsOffered: ['Python', 'React', 'JavaScript'],
        skillsNeeded: ['Figma', 'UI/UX', 'Spanish'],
        bio: 'Computer Science major at Stanford. Love coding, open-source, and coffee. Happy to teach web development or Python script basics!',
        avatar: 'https://ui-avatars.com/api/?name=Alice+Vance&background=f472b6&color=fff&size=128',
      },
      {
        name: 'Bob Miller',
        email: 'bob@example.com',
        password: hashedPassword,
        skillsOffered: ['Figma', 'UI/UX', 'Graphic Design'],
        skillsNeeded: ['Python', 'React', 'Guitar'],
        bio: 'Graphic Design student. Passionate about interfaces, wireframes, and vector illustration. Wanting to learn coding to build prototypes.',
        avatar: 'https://ui-avatars.com/api/?name=Bob+Miller&background=60a5fa&color=fff&size=128',
      },
      {
        name: 'Carlos Santana',
        email: 'carlos@example.com',
        password: hashedPassword,
        skillsOffered: ['Spanish', 'Guitar', 'Music Theory'],
        skillsNeeded: ['Python', 'Photography'],
        bio: 'Music major and native Spanish speaker from Madrid. Can teach you classical/acoustic guitar techniques and conversational Spanish.',
        avatar: 'https://ui-avatars.com/api/?name=Carlos+Santana&background=34d399&color=fff&size=128',
      },
      {
        name: 'Diana Prince',
        email: 'diana@example.com',
        password: hashedPassword,
        skillsOffered: ['Photography', 'French', 'Lightroom'],
        skillsNeeded: ['Figma', 'Cooking'],
        bio: 'Freelance photographer and digital editor. Fluent in French. Looking to improve design tool skills and learn basic culinary skills!',
        avatar: 'https://ui-avatars.com/api/?name=Diana+Prince&background=fbbf24&color=fff&size=128',
      },
      {
        name: 'Evan Wright',
        email: 'evan@example.com',
        password: hashedPassword,
        skillsOffered: ['Cooking', 'Baking', 'Public Speaking'],
        skillsNeeded: ['JavaScript', 'French'],
        bio: 'Culinary arts student and debate club leader. Happy to share gourmet cooking secrets, sourdough baking, or speech drafting guides.',
        avatar: 'https://ui-avatars.com/api/?name=Evan+Wright&background=a78bfa&color=fff&size=128',
      },
    ];

    const createdUsers = await User.create(users);
    console.log(`Seeded ${createdUsers.length} users successfully.`);

    const adminUser = createdUsers[0];
    const alice = createdUsers[1];
    const bob = createdUsers[2];
    const carlos = createdUsers[3];
    const diana = createdUsers[4];
    const evan = createdUsers[5];

    console.log('Seeding mock swap sessions...');
    
    // A completed session between Alice and Bob: Bob taught Alice Figma, Alice taught Bob Python
    const datePast = new Date();
    datePast.setDate(datePast.getDate() - 3);

    const session1 = await Session.create({
      sender: bob._id, // Bob requested
      receiver: alice._id, // to swap with Alice
      offeredSkill: 'Figma', // Bob teaches Figma
      receivedSkill: 'Python', // Bob learns Python
      sessionDate: datePast,
      duration: 60,
      status: 'completed',
    });

    // A pending session request: Carlos requested Spanish lessons in exchange for Alice's Python lessons
    const dateFuture = new Date();
    dateFuture.setDate(dateFuture.getDate() + 2);

    const session2 = await Session.create({
      sender: carlos._id,
      receiver: alice._id,
      offeredSkill: 'Spanish',
      receivedSkill: 'Python',
      sessionDate: dateFuture,
      duration: 45,
      status: 'pending',
    });

    // An accepted session: Evan teaching Diana cooking, Diana teaching Evan French
    const session3 = await Session.create({
      sender: diana._id,
      receiver: evan._id,
      offeredSkill: 'French',
      receivedSkill: 'Cooking',
      sessionDate: dateFuture,
      duration: 90,
      status: 'accepted',
    });

    console.log('Seeded sample swap sessions.');

    console.log('Seeding review for completed session...');
    // Alice reviews Bob for teaching her Figma
    const review1 = await Review.create({
      reviewer: alice._id,
      reviewee: bob._id,
      session: session1._id,
      rating: 5,
      comment: 'Bob was an amazing Figma tutor! He walked me through frames, components, and auto-layout. Highly recommend swapping skills with him!',
    });

    // Bob reviews Alice for teaching him Python
    const review2 = await Review.create({
      reviewer: bob._id,
      reviewee: alice._id,
      session: session1._id,
      rating: 5,
      comment: 'Alice explained Python functions and lists so clearly. As a designer, code always scared me, but she made it super accessible. Thank you!',
    });

    console.log('Seeded reviews and triggered rating aggregates.');

    console.log('Seeding conversation logs...');
    
    // Alice and Bob discussion
    await Message.create([
      {
        sender: bob._id,
        receiver: alice._id,
        content: 'Hi Alice! I saw you are looking for Figma skills and teach React. I would love to do a swap session!',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        sender: alice._id,
        receiver: bob._id,
        content: 'Hey Bob! Yes, that sounds like a perfect match! I need help with a UI prototype. When are you free?',
        createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
      },
      {
        sender: bob._id,
        receiver: alice._id,
        content: 'I can do Wednesday evening or Saturday morning. What works best for you?',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        read: true,
      },
      {
        sender: alice._id,
        receiver: bob._id,
        content: 'Let’s do Wednesday! I will send over a session invite.',
        createdAt: new Date(Date.now() - 2.8 * 60 * 60 * 1000),
      },
    ]);

    // Carlos and Alice discussion
    await Message.create([
      {
        sender: carlos._id,
        receiver: alice._id,
        content: 'Hola Alice! Would you be down to trade some Python help for conversational Spanish?',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('Seeded conversation messages.');

    console.log('Database seeding complete successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
};

seedData();
