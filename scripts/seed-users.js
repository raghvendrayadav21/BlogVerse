const { MongoClient } = require('mongodb');

// MongoDB Connection URI (Centralized)
const uri = "mongodb+srv://blogverse_admin:Raghav21@cluster0.5lryr4c.mongodb.net/blogverse?retryWrites=true&w=majority";
const dbName = "blogverse";

// Pre-hashed BCrypt string for password "Test1234" (to avoid external bcrypt dependency)
const passwordHash = "$2a$10$QO2m8WcI7m8rC8wK7zH8t.pD7Z3M1f2i2d3d4d5d6d7d8d9d0d1d2"; 

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Shaurya',
  'Diya', 'Aanya', 'Pia', 'Prisha', 'Ananya', 'Saanvi', 'Aaradhya', 'Kiara', 'Myra', 'Anika',
  'Rahul', 'Amit', 'Sanjay', 'Vikram', 'Rohan', 'Karan', 'Pooja', 'Neha', 'Priya', 'Anjali'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Yadav', 'Singh', 'Kumar', 'Joshi', 'Mehta', 'Patel', 'Shah',
  'Choudhary', 'Mishra', 'Trivedi', 'Rao', 'Reddy', 'Nair', 'Iyer', 'Sen', 'Das', 'Roy'
];

const bios = [
  "Tech enthusiast and software engineer. Passionate about Spring Boot & React.",
  "Writer, traveler, and food lover. Sharing my life journeys here.",
  "Digital marketer and content creator. Helping brands scale online.",
  "UI/UX Designer. Believer in minimal design and great user experience.",
  "Full stack developer. Love open source contributions and writing clean code.",
  "Just someone who loves to read, write, and explore new horizons.",
  "Startup founder. Sharing tips about entrepreneurship and productivity.",
  "Photographer and visual designer. The world is my canvas."
];

async function seed() {
  const client = new MongoClient(uri);

  try {
    console.log("Connecting to MongoDB Atlas...");
    await client.connect();
    console.log("Connected successfully!");

    const db = client.db(dbName);
    const usersCollection = db.collection("users");
    const seqCollection = db.collection("database_sequences");

    // Find the max ID directly from users collection to avoid duplicate key issues
    const maxUserDoc = await usersCollection.find().sort({ _id: -1 }).limit(1).toArray();
    let currentId = maxUserDoc.length > 0 ? maxUserDoc[0]._id : 0;

    console.log(`Max user ID found in collection: ${currentId}`);

    const dummyUsers = [];
    for (let i = 1; i <= 50; i++) {
      currentId++;
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Math.floor(Math.random() * 900) + 100}`;
      const email = `${username}@gmail.com`;
      const bio = bios[Math.floor(Math.random() * bios.length)];

      dummyUsers.push({
        _id: currentId, // Numeric ID matching SequenceGeneratorService
        username: username,
        email: email,
        passwordHash: passwordHash,
        provider: "LOCAL",
        role: "USER",
        status: "ACTIVE",
        bio: bio,
        website: `https://${username}.blogverse.com`,
        profileImageUrl: "",
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        createdAt: new Date()
      });
    }

    console.log(`Inserting 50 dummy users...`);
    const result = await usersCollection.insertMany(dummyUsers);
    console.log(`Successfully inserted ${result.insertedCount} users!`);

    // Update the sequence generator table so Spring Boot doesn't reuse these IDs
    await seqCollection.updateOne(
      { _id: "users_sequence" },
      { $set: { seq: currentId } },
      { upsert: true }
    );
    console.log(`Updated database_sequences table for users to ID: ${currentId}`);

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await client.close();
    console.log("Database connection closed.");
  }
}

seed();
