/**
 * DJ Nuff Jamz Photo Index - OPTIMIZED FOR SQUARE IMAGES
 * 
 * IMPORTANT: Update this file whenever you add new photos to the uploads folder!
 * 
 * Instructions:
 * 1. Upload your SQUARE photos to: public/images/gallery/uploads/
 * 2. Add the filename to the array below
 * 3. The system will auto-categorize and show clean, minimal info
 * 
 * ✨ SQUARE IMAGE SPECS (Perfect for your photos!):
 * - Dimensions: 1000x1000px to 2000x2000px (ideal: 1200x1200px)
 * - File Size: 300KB - 1MB (keep under 1MB for fast loading)
 * - Format: JPG (best for photos)
 * - Quality: 85-95% (balances size vs quality)
 * 
 * 🏷️ What Shows for Each Photo (Clean & Minimal):
 * - Event Type: Auto-detected from filename (Corporate Event, Club Night, etc.)
 * - View/Like Stats: Realistic random numbers for social proof
 * - Categories: For filtering (Action, Crowd, Venue, etc.)
 * - NO generic titles or venues until you add specific details
 * 
 * Naming Tips for Better Auto-Detection:
 * - Include event type: wedding, corporate, birthday, club, private, studio
 * - Examples: corporate-event-1.jpg, club-3.jpg, private-party-2.jpg
 */

// UPDATE THIS ARRAY when you add new photos:
window.uploadedPhotosList = [
    // Club Events
    'club-1.jpg',
    'club-2.jpg',
    'club-3.jpg',
    'club-4.jpg',
    
    // Corporate Events
    'corporate-event-1.jpg',
    'corporate-event-2.jpg',
    'corporate-event-3.jpg',
    'corporate-event-4.jpg',
    'corporate-event-5.jpg',
    'corporate-event-6.jpg',
    'corporate-event-7.jpg',
    'corporate-event-8.jpg',
    
    // Private Parties
    'private-party-1.jpg',
    'private-party-2.jpg',
    'private-party-3.jpg',
    
    // Studio Sessions
    'studio-session-1.jpg'
];

// 🎯 ADD SPECIFIC DETAILS HERE when the DJ provides them:
// (Photos will show cleaner without generic info until then)
window.photoOverrides = {
    // Example format - only add details you actually know:
    // 'corporate-event-1.jpg': {
    //     title: 'Microsoft Annual Conference',
    //     venue: 'Los Angeles Convention Center',
    //     eventDate: '2024-03-15',
    // },
    // 'club-2.jpg': {
    //     title: 'Saturday Night at The Avalon',
    //     venue: 'Avalon Hollywood'
    // },
    // 'private-party-1.jpg': {
    //     title: 'Jessica\'s 30th Birthday Bash',
    //     venue: 'Private Residence, Beverly Hills'
    // }
    
    // Keep this empty until you get specific event details from the DJ!
};

console.log('📋 Photo index loaded:', window.uploadedPhotosList.length, 'photos configured');
