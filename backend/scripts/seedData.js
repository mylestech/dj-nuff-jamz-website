/**
 * Seed Data Script
 * Populates MongoDB with sample data for development
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { Music, Gallery, Booking, Contact } = require('../models');

// Sample Music Data
const musicSeedData = [
  {
    title: "Summer Vibes Mix 2024",
    artist: "DJ Nuff Jamz",
    genre: "house",
    subGenre: "deep house",
    bpm: 128,
    key: "Am",
    duration: 3600, // 60 minutes
    mixType: "live-mix",
    isPublic: true,
    featured: true,
    tags: ["summer", "deep", "house", "vibes", "live"],
    description: "A perfect deep house mix for summer parties and beach events",
    playCount: 1250,
    likes: 89,
    releaseDate: new Date('2024-06-15')
  },
  {
    title: "Hip Hop Heat",
    artist: "DJ Nuff Jamz",
    genre: "hip-hop",
    bpm: 95,
    key: "C",
    duration: 210, // 3.5 minutes
    mixType: "remix",
    isPublic: true,
    featured: false,
    tags: ["hip-hop", "rap", "urban", "party"],
    description: "High-energy hip hop track perfect for clubs and parties",
    playCount: 892,
    likes: 67,
    releaseDate: new Date('2024-08-01')
  },
  {
    title: "Latin Fusion",
    artist: "DJ Nuff Jamz",
    genre: "latin",
    bpm: 105,
    key: "Dm",
    duration: 285, // 4 minutes 45 seconds
    mixType: "original",
    isPublic: true,
    featured: true,
    tags: ["latin", "reggaeton", "fusion", "dance"],
    description: "A fusion of traditional Latin rhythms with modern electronic beats",
    playCount: 743,
    likes: 54,
    releaseDate: new Date('2024-07-20')
  },
  {
    title: "Wedding Classics Medley",
    artist: "DJ Nuff Jamz",
    genre: "pop",
    bpm: 120,
    key: "G",
    duration: 1800, // 30 minutes
    mixType: "live-mix",
    isPublic: true,
    featured: false,
    tags: ["wedding", "classics", "romantic", "celebration"],
    description: "Perfect wedding reception mix with timeless classics",
    playCount: 456,
    likes: 32,
    releaseDate: new Date('2024-05-10')
  },
  {
    title: "Corporate Energy",
    artist: "DJ Nuff Jamz",
    genre: "edm",
    bpm: 132,
    key: "F#",
    duration: 240, // 4 minutes
    mixType: "extended",
    isPublic: true,
    featured: false,
    tags: ["corporate", "energy", "edm", "motivational"],
    description: "Upbeat EDM track perfect for corporate events and presentations",
    playCount: 198,
    likes: 15,
    releaseDate: new Date('2024-09-01')
  }
];

// Sample Gallery Data
const gallerySeedData = [
  {
    title: "Summer Beach Wedding - Sarah & Mike",
    description: "Beautiful oceanfront wedding with DJ entertainment",
    eventType: "wedding",
    venue: "Malibu Beach Resort",
    location: {
      city: "Malibu",
      state: "CA",
      country: "USA"
    },
    eventDate: new Date('2024-06-15'),
    imageUrl: "https://example.com/images/wedding-beach-1.jpg",
    thumbnailUrl: "https://example.com/images/thumbs/wedding-beach-1.jpg",
    category: "action",
    tags: ["beach", "wedding", "sunset", "romantic"],
    isPublic: true,
    featured: true,
    isPortfolio: true,
    photographer: "Professional Event Photography",
    altText: "DJ Nuff Jamz performing at beachfront wedding ceremony",
    views: 342,
    likes: 28
  },
  {
    title: "Corporate Gala 2024",
    description: "Annual corporate gala with live DJ entertainment",
    eventType: "corporate",
    venue: "Downtown Convention Center",
    location: {
      city: "Los Angeles",
      state: "CA",
      country: "USA"
    },
    eventDate: new Date('2024-08-20'),
    imageUrl: "https://example.com/images/corporate-gala-1.jpg",
    thumbnailUrl: "https://example.com/images/thumbs/corporate-gala-1.jpg",
    category: "venue",
    tags: ["corporate", "gala", "professional", "networking"],
    isPublic: true,
    featured: false,
    isPortfolio: true,
    clientName: "TechCorp Industries",
    isClientApproved: true,
    altText: "DJ setup at corporate gala event",
    views: 156,
    likes: 12
  },
  {
    title: "Birthday Bash - 30th Celebration",
    description: "High-energy 30th birthday party with dance floor action",
    eventType: "birthday",
    venue: "Private Residence",
    location: {
      city: "Beverly Hills",
      state: "CA",
      country: "USA"
    },
    eventDate: new Date('2024-07-10'),
    imageUrl: "https://example.com/images/birthday-party-1.jpg",
    thumbnailUrl: "https://example.com/images/thumbs/birthday-party-1.jpg",
    category: "crowd",
    tags: ["birthday", "party", "dancing", "celebration"],
    isPublic: true,
    featured: true,
    isPortfolio: false,
    altText: "Crowd dancing at 30th birthday celebration",
    views: 289,
    likes: 23
  },
  {
    title: "Club Night - Downtown Venue",
    description: "Electric club atmosphere with packed dance floor",
    eventType: "club-night",
    venue: "The Underground",
    location: {
      city: "Hollywood",
      state: "CA",
      country: "USA"
    },
    eventDate: new Date('2024-09-05'),
    imageUrl: "https://example.com/images/club-night-1.jpg",
    thumbnailUrl: "https://example.com/images/thumbs/club-night-1.jpg",
    category: "dj-booth",
    tags: ["club", "nightlife", "electronic", "energy"],
    isPublic: true,
    featured: false,
    isPortfolio: true,
    altText: "DJ Nuff Jamz behind the decks at club event",
    views: 445,
    likes: 37
  },
  {
    title: "Studio Session - New Mix Recording",
    description: "Behind the scenes recording new summer mix",
    eventType: "studio-session",
    venue: "SoundWave Studios",
    location: {
      city: "Burbank",
      state: "CA",
      country: "USA"
    },
    eventDate: new Date('2024-06-01'),
    imageUrl: "https://example.com/images/studio-session-1.jpg",
    thumbnailUrl: "https://example.com/images/thumbs/studio-session-1.jpg",
    category: "behind-scenes",
    tags: ["studio", "recording", "production", "mixing"],
    isPublic: true,
    featured: false,
    isPortfolio: false,
    altText: "DJ Nuff Jamz in recording studio working on new mix",
    views: 123,
    likes: 8
  }
];

// Sample Booking Data
const bookingSeedData = [
  {
    name: "Jennifer Martinez",
    email: "jennifer@email.com",
    phone: "(555) 123-4567",
    eventType: "wedding",
    eventDate: new Date('2025-12-15'),
    eventLocation: "Grand Ballroom, Hotel California, Los Angeles",
    guestCount: 150,
    budget: 3500,
    musicPreferences: "Mix of romantic classics, modern pop, and some Latin music for dancing",
    specialRequests: "Need wireless microphone for speeches, fog machine for first dance",
    contactMethod: "both",
    status: "pending",
    quotedPrice: 3200,
    adminNotes: "Venue has excellent sound system. Client seems very organized."
  },
  {
    name: "TechStart Inc - David Chen",
    email: "events@techstart.com",
    phone: "(555) 987-6543",
    eventType: "corporate",
    eventDate: new Date('2025-11-22'),
    eventLocation: "Convention Center Downtown, Hall A",
    guestCount: 300,
    budget: 5000,
    musicPreferences: "Upbeat background music during networking, energetic music for after-party",
    specialRequests: "Need to coordinate with AV team, microphone for presentations",
    contactMethod: "email",
    status: "confirmed",
    quotedPrice: 4500,
    adminNotes: "Annual company party. Good client, paid 50% deposit."
  },
  {
    name: "Michael Rodriguez",
    email: "mike.r.party@gmail.com",
    phone: "(555) 456-7890",
    eventType: "birthday",
    eventDate: new Date('2025-10-30'),
    eventLocation: "Backyard Party, 123 Oak Street, Santa Monica",
    guestCount: 75,
    budget: 1800,
    musicPreferences: "Hip hop, reggaeton, some throwback hits from the 90s and 2000s",
    specialRequests: "Outdoor setup, need to bring full sound system",
    contactMethod: "phone",
    status: "confirmed",
    quotedPrice: 1600,
    adminNotes: "40th birthday surprise party. Client confirmed all setup requirements."
  },
  {
    name: "Sarah & Tom Wilson",
    email: "sarahtom2024@email.com",
    phone: "(555) 234-5678",
    eventType: "anniversary",
    eventDate: new Date('2025-11-10'),
    eventLocation: "Private Home, 456 Sunset Blvd, Hollywood Hills",
    guestCount: 50,
    budget: 2200,
    musicPreferences: "Romantic ballads, jazz standards, some classic rock",
    specialRequests: "Intimate setting, lower volume for conversation",
    contactMethod: "email",
    status: "pending",
    adminNotes: "25th anniversary celebration. Clients want elegant, sophisticated atmosphere."
  }
];

// Sample Contact Data
const contactSeedData = [
  {
    name: "Amanda Johnson",
    email: "amanda.j@email.com",
    phone: "(555) 111-2222",
    subject: "Pricing for Summer Event",
    message: "Hi! I'm planning a summer graduation party for about 100 guests. Could you send me your pricing information and availability for July dates?",
    contactMethod: "email",
    status: "pending"
  },
  {
    name: "Robert Kim",
    email: "robert.kim@company.com",
    phone: "(555) 333-4444",
    subject: "Corporate Event Inquiry",
    message: "We're looking for a DJ for our company's 10th anniversary celebration. The event will be held at a hotel ballroom with approximately 200 attendees. Please let me know your availability for September.",
    contactMethod: "both",
    status: "in-progress"
  },
  {
    name: "Lisa Thompson",
    email: "lisa.t.wedding@gmail.com",
    phone: "(555) 555-6666",
    subject: "Wedding DJ Services",
    message: "My fiancé and I are getting married next spring and we love your music style! We'd like to discuss our wedding reception entertainment. The venue is in Malibu.",
    contactMethod: "phone",
    status: "pending"
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      Music.deleteMany({}),
      Gallery.deleteMany({}),
      Booking.deleteMany({}),
      Contact.deleteMany({})
    ]);
    console.log('✅ Existing data cleared');

    // Insert seed data
    console.log('📁 Inserting seed data...');
    
    const [musicResults, galleryResults, bookingResults, contactResults] = await Promise.all([
      Music.insertMany(musicSeedData),
      Gallery.insertMany(gallerySeedData),
      Booking.insertMany(bookingSeedData),
      Contact.insertMany(contactSeedData)
    ]);

    console.log(`✅ Inserted ${musicResults.length} music tracks`);
    console.log(`✅ Inserted ${galleryResults.length} gallery items`);
    console.log(`✅ Inserted ${bookingResults.length} booking requests`);
    console.log(`✅ Inserted ${contactResults.length} contact submissions`);

    // Display some statistics
    console.log('\n📊 Database Statistics:');
    const [musicStats, galleryStats] = await Promise.all([
      Music.getStats(),
      Gallery.getStats()
    ]);

    console.log('🎵 Music Stats:', musicStats.overview);
    console.log('📸 Gallery Stats:', galleryStats.overview);

    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  musicSeedData,
  gallerySeedData,
  bookingSeedData,
  contactSeedData
};
