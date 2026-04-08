require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Bike = require('./models/Bike');

const bikes = [
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Honda CD 70",
    model: "2024 Standard",
    price: 157900,
    fuel_avg: 70,
    colors: ["Red", "Black"],
    engine_cc: 70,
    images: [
      "/motorcycle-placeholder.png", 
      "/motorcycle-placeholder.png"
    ],
    thumbnail: "/motorcycle-placeholder.png",
    description: "The most popular economical bike in Pakistan, known for its fuel efficiency and durability."
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Yamaha YBR 125",
    model: "2024 Z DX",
    price: 466000,
    fuel_avg: 45,
    colors: ["Metallic Gray", "Racing Blue", "Vivid Red"],
    engine_cc: 125,
    images: [
      "/motorcycle-placeholder.png",
      "/motorcycle-placeholder.png"
    ],
    thumbnail: "/motorcycle-placeholder.png",
    description: "A premium 125cc bike with sporty looks and a smooth ride, ideal for urban commuting."
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Honda CB 150F",
    model: "2024 Special Edition",
    price: 493900,
    fuel_avg: 35,
    colors: ["Black", "Silver", "Red"],
    engine_cc: 150,
    images: [
      "/motorcycle-placeholder.png",
      "/motorcycle-placeholder.png"
    ],
    thumbnail: "/motorcycle-placeholder.png",
    description: "Powerful 150cc engine with advanced suspension and a masculine design."
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Suzuki GS 150",
    model: "2024 Euro II",
    price: 382000,
    fuel_avg: 40,
    colors: ["Black", "Blue"],
    engine_cc: 150,
    images: [
      "/motorcycle-placeholder.png",
      "/motorcycle-placeholder.png"
    ],
    thumbnail: "/motorcycle-placeholder.png",
    description: "Known for its heavy engine sound and comfortable long-ride capabilities."
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Kawasaki Ninja 400",
    model: "2024 Sport",
    price: 2400000,
    fuel_avg: 25,
    colors: ["Lime Green", "Ebony"],
    engine_cc: 400,
    images: [
      "/motorcycle-placeholder.png",
      "/motorcycle-placeholder.png"
    ],
    thumbnail: "/motorcycle-placeholder.png",
    description: "A high-performance sports bike for those who seek speed and premium engineering."
  }
];

const seedDB = async () => {
  try {
    // Write to local file first
    fs.writeFileSync(path.join(__dirname, 'bikes.json'), JSON.stringify(bikes, null, 2));
    console.log("Written to local bikes.json...");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");
    
    await Bike.deleteMany({});
    console.log("Deleted existing bikes...");
    
    await Bike.insertMany(bikes);
    console.log("Seeding complete: 5 bikes added.");
    
    process.exit(0);
  } catch (err) {
    console.error("MongoDB seeding error (handled by local file write):", err.message);
    process.exit(0);
  }
};

seedDB();
