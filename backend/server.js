require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Bike = require('./models/Bike');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyD-dummy-key");

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
let isConnected = false;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    isConnected = true;
    console.log('Connected to MongoDB Successfully.');
  })
  .catch((err) => {
    console.error('MongoDB Connection Error. Falling back to local data. Error:', err.message);
  });

// Helper to fetch bike data
const getBikesData = async () => {
  if (isConnected) {
    return await Bike.find();
  } else {
    try {
      return JSON.parse(fs.readFileSync(path.join(__dirname, 'bikes.json'), 'utf8'));
    } catch (e) {
      return [];
    }
  }
};

// Routes

// 1. Get all bikes (Bike Listing)
app.get('/api/bikes', async (req, res) => {
  try {
    const data = await getBikesData();
    const simplifiedData = data.map(bike => ({
      _id: bike._id,
      name: bike.name,
      model: bike.model,
      price: bike.price,
      thumbnail: bike.thumbnail
    }));
    return res.status(200).json(simplifiedData);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// 2. Get specific bike details
app.get('/api/bikes/:id', async (req, res) => {
  try {
    const data = await getBikesData();
    const bike = data.find(b => b._id.toString() === req.params.id);
    if (!bike) return res.status(404).json({ message: "Bike Not Found" });
    return res.status(200).json(bike);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// 3. AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ message: "Message is required" });

  try {
    const bikesData = await getBikesData();
    const cleanBikesData = bikesData.map(b => ({
      name: b.name, model: b.model, price: b.price, fuel_avg: b.fuel_avg, colors: b.colors, engine_cc: b.engine_cc
    }));

    const systemInstruction = `
You are a "Bike Expert AI Assistant" for Blizzup Bikes, a premium bike dealership in Pakistan.
Your goal is to help users compare bikes, score them out of 100, and recommend the best one.

Available Inventory Data:
${JSON.stringify(cleanBikesData, null, 2)}

Rules:
1. Determine how many and which bikes the user wants to compare (from 2 to 5). If they don't specify, ask them first.
2. If the user asks for a bike NOT in the inventory, add it to "unrecognizedBikes".
3. Check previous conversation context.
4. If the user is ready to compare with specific requested bikes, calculate a score out of 100 for each bike based on:
   - Price (20 pts): Lower price = higher score.
   - Fuel Average (20 pts): Higher km/l = higher score.
   - Engine Power (20 pts): Best CC for its class/price.
   - Value for Money (20 pts): Overall specs-to-price ratio.
   - Features & Colors (20 pts): More colors and features = higher score.
5. You must return your response strictly as JSON matching this schema:
{
  "reply": "Conversational response asking questions or explaining the comparison",
  "isComparison": boolean (true if providing table scores for 2-5 bikes, false if just chatting/gathering requirements),
  "unrecognizedBikes": ["array of exact bike names requested by user that are not in inventory (can be empty)"],
  "bikes": [ 
    { "name": "Honda CD 70", "totalScore": 85 }
  ],
  "scores": [
    {
      "category": "Price",
      "bikeScores": [95, 75] // Index must map directly to bikes array above
    },
    // Must include 5 categories: Price, Fuel Average, Engine Power, Value for Money, Features & Colors
  ],
  "verdict": "Detailed justification on which bike is the best"
}
`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" },
      systemInstruction: systemInstruction 
    });

    // Format chat history for Gemini
    const contents = history.map(msg => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg) }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const result = await model.generateContent({ contents });
    const response = await result.response;
    const text = response.text();
    
    // As responseMimeType is set to 'application/json', the result is guaranteed to be a valid JSON string.
    res.json(JSON.parse(text));

  } catch (err) {
    console.error("AI Error:", err.message);
    res.status(500).json({ message: "AI Error", error: err.message });
  }
});

// 4. AI Bulk Ingest (Auto-Add)
app.post('/api/bikes/ai-add', async (req, res) => {
  const { names } = req.body; // Array of strings (e.g. ["BMW R1250GS", "Ducati Panigale V4"])
  if (!names || !Array.isArray(names)) {
    return res.status(400).json({ message: "An array of bike names is required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      You are a technical data assistant for a premium bike dealership.
      For each bike name in the following list: ${JSON.stringify(names)}
      
      Generate a valid JSON object matching this schema:
      {
        "name": "Full Name (e.g. BMW)",
        "model": "Model Name (e.g. R 1250 GS)",
        "price": Number (Realistic price in PKR, approx 3-8 million for high end, 150k-500k for local),
        "engine_cc": Number (e.g. 1250),
        "fuel_avg": Number (km/l),
        "transmission": "Manual/Automatic",
        "colors": ["Color1", "Color2"],
        "thumbnail": "A generated URL precisely in this format: https://image.pollinations.ai/prompt/Realistic%20photograph%20of%20a%20[Brand]%20[Model]%20motorcycle?width=800&height=450&nologo=true (Replace [Brand] and [Model] with actual names, URL encoded, no spaces)"
      }
      
      Return ONLY a JSON array of these objects. No markdown.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AI failed to generate valid array");
    
    const newBikes = JSON.parse(jsonMatch[0]);
    
    // Save to DB or Local
    let savedCount = 0;
    if (isConnected) {
      const results = await Bike.insertMany(newBikes);
      savedCount = results.length;
    } else {
      const current = await getBikesData();
      const updated = [...current, ...newBikes.map((b, i) => ({ ...b, _id: Date.now() + i }))];
      fs.writeFileSync(path.join(__dirname, 'bikes.json'), JSON.stringify(updated, null, 2));
      savedCount = newBikes.length;
    }

    res.status(201).json({ message: `Successfully added ${savedCount} bikes via AI.`, bikes: newBikes });
  } catch (err) {
    console.error("AI Ingest Error:", err.message);
    res.status(500).json({ message: "AI Ingest Error", error: err.message });
  }
});

// 5. Delete Bike
app.delete('/api/bikes/:id', async (req, res) => {
  try {
    if (isConnected) {
      const deletedBike = await Bike.findByIdAndDelete(req.params.id);
      if (!deletedBike) return res.status(404).json({ message: "Bike Not Found" });
    } else {
      const bikes = await getBikesData();
      const filtered = bikes.filter(b => b._id.toString() !== req.params.id);
      if (bikes.length === filtered.length) return res.status(404).json({ message: "Bike Not Found" });
      fs.writeFileSync(path.join(__dirname, 'bikes.json'), JSON.stringify(filtered, null, 2));
    }
    res.status(200).json({ message: "Bike deleted successfully", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// --- AUTH HELPER ---
const getUsersData = async () => {
  if (isConnected) {
    return await User.find();
  } else {
    try {
      return JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8'));
    } catch (e) {
      return [];
    }
  }
};

const saveUsersDataLocally = (users) => {
  fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
};

// --- AUTHENTICATION ROUTES ---

// Auth Registration Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

    let users = await getUsersData();
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { name, email, password: hashedPassword };

    if (isConnected) {
      const dbUser = new User(newUser);
      await dbUser.save();
      newUser._id = dbUser._id;
    } else {
      newUser._id = Date.now().toString();
      users.push(newUser);
      saveUsersDataLocally(users);
    }

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
    res.status(201).json({ token, user: { _id: newUser._id, name, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Auth Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let users = await getUsersData();
    
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/', (req, res) => res.send('Blizzup API is live!'));

// Health check
app.get('/health', (req, res) => res.send('Backend is running.'));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
