require('dotenv').config();
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Bike = require('./models/Bike');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function repairImages() {
  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected Successfully.");

    const bikes = await Bike.find();
    console.log(`Found ${bikes.length} bikes. Regenerating thumbnails...`);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    for (const bike of bikes) {
      console.log(`Processing ${bike.name} ${bike.model}...`);
      
      const prompt = `
        Create a URL-encoded descriptive prompt for an AI image generator for this motorcycle/bicycle:
        Name: ${bike.name}
        Model: ${bike.model}
        
        The description should be like: "Professional studio side-view photograph of a [REALISTIC DESCRIPTION], white background, high resolution, 8k"
        
        Return ONLY the URL-encoded description string. No other text.
      `;

      const result = await model.generateContent(prompt);
      const description = result.response.text().trim().replace(/['"]/g, '');
      const encodedDescription = encodeURIComponent(description);
      
      const newThumbnail = `https://image.pollinations.ai/prompt/${encodedDescription}?width=800&height=450&nologo=true`;
      
      await Bike.findByIdAndUpdate(bike._id, { thumbnail: newThumbnail });
      console.log(`Updated ${bike.name} successfully.`);
    }

    console.log("Repair Complete!");
    process.exit(0);
  } catch (err) {
    console.error("Repair Failed:", err);
    process.exit(1);
  }
}

repairImages();
