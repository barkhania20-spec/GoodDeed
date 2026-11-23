
const mongoose = require('mongoose');
require('dotenv').config();

const opportunitySchema = new mongoose.Schema({
  title: String,
  organization: String,
  category: String,
  location: String,
  date: String,
  description: String
});

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

const opportunities = [
  {
    title: 'Teach Children, Shape Futures',
    organization: 'Udaan Foundation',
    category: 'Education',
    location: 'New Delhi',
    date: 'Every Weekend',
    description: 'Help underprivileged children learn essential subjects and build a brighter future.'
  },
  {
    title: 'Join the Green Earth Movement',
    organization: 'Green India Initiative',
    category: 'Environment',
    location: 'Noida',
    date: '25 November 2026',
    description: 'Take part in tree plantation drives and help create a cleaner environment.'
  },
  {
    title: 'Spread Kindness Through Food',
    organization: 'Helping Hands NGO',
    category: 'Community',
    location: 'Delhi',
    date: '28 November 2026',
    description: 'Help distribute nutritious meals to families and people in need.'
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    await Opportunity.deleteMany({});
    await Opportunity.insertMany(opportunities);

    console.log('Successfully added 3 opportunities to MongoDB!');
  } catch (error) {
    console.error('Seeding failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
