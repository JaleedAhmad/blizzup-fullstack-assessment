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

// --- AGENTIC TOOLS ---
const bikeTools = [
  {
    functionDeclarations: [
      {
        name: "fetch_bike_data",
        description: "Retrieves specific bike technical specifications from the inventory database using a bike name or model.",
        parameters: {
          type: "OBJECT",
          properties: {
            bikeName: {
              type: "STRING",
              description: "The name of the bike to search for (e.g., 'Honda CD 70' or 'Yamaha YBR')."
            }
          },
          required: ["bikeName"]
        }
      }
    ]
  }
];

const localFetchBike = async (name) => {
  try {
    const bikes = await getBikesData();
    const query = name.toLowerCase();
    // Fuzzy match: check if name or model is included
    const bike = bikes.find(b => 
      b.name.toLowerCase().includes(query) || 
      b.model.toLowerCase().includes(query) ||
      query.includes(b.name.toLowerCase())
    );
    if (!bike) return { error: `Bike '${name}' not found in Blizzup inventory.` };
    return {
      name: bike.name,
      model: bike.model,
      price: bike.price,
      fuel_avg: bike.fuel_avg,
      engine_cc: bike.engine_cc,
      colors: bike.colors,
      transmission: bike.transmission || "Manual",
      status: "Verified in Database"
    };
  } catch (err) {
    return { error: "Database retrieval failed." };
  }
};

// 3. AI Chat Endpoint (Agentic Version)
app.post('/api/chat', async (req, res) => {
  const { message, history = [], sessionState = "Step 1: GREETING", bikesInMemory = [] } = req.body;
  if (!message) return res.status(400).json({ message: "Message is required" });

  try {
    const systemInstruction = `
You are the "Bike Expert AI Agent" for Blizzup Technologies. You are a true agent capable of fetching real-time data from our database using the fetch_bike_data tool.

You must follow a strict 6-step conversation flow. Do not skip steps.
CURRENT CONVERSATION STATE: ${sessionState}
CURRENT BIKES IN MEMORY: ${JSON.stringify(bikesInMemory)}

### CONVERSATION FLOW RULES
Step 1: Greet & Ask. Greet the user and ask: "How many bikes would you like to compare? (2-5)"
Step 2: Collect Bike Names. Ask the user for the bike names one by one. Confirm each name using the tool immediately.
Step 3: Fetch & Analyze Data. Once all names are collected, you MUST have used the fetch_bike_data tool for each. Do NOT use external knowledge.
Step 4: Score Each Bike. Calculate scores out of 100 based strictly on the retrieved database values.
Step 5 & 6: Show Comparison & Final Recommendation. Output the comparison table data and provide a detailed, human-readable justification of WHY the winning bike is the best choice.

### SCORING CRITERIA (Out of 100 points total)
You must calculate and explain the score for each category.
1. Price (20 pts): Lower price gets a higher score relative to other bikes in the set.
2. Fuel Average (20 pts): Higher km/l gets a higher score.
3. Engine Power (CC) (20 pts): Score based on the best CC for the price range.
4. Value for Money (20 pts): Specs vs. price ratio.
5. Features & Colors (20 pts): More color options and features equals a higher score.

### OUTPUT FORMAT
You must respond in valid JSON format matching this schema:
{
  "reply": "Your conversational text addressing the user based on the current step.",
  "internal_thought": "Your step-by-step mathematical reasoning for how you calculated the scores. You must explain how each score was calculated for every category.",
  "isComparisonReady": boolean (true ONLY if you are at Step 5/6),
  "nextState": "The next conversation state (e.g. Step 2: COLLECTING_NAMES)",
  "collectedBikes": ["Updated array of bike names confirmed in memory"],
  "comparisonData": {
     "bikes": [{ "name": "...", "totalScore": 0 }],
     "categoryScores": [ { "category": "...", "bikeScores": [] } ]
  }
}

CRITICAL RULES:
- Never make up specs. 
- All data MUST come from the fetch_bike_data tool.
- You must explain to the user how each score was calculated in your reply.
`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      tools: bikeTools
    });

    // Helper for retries
    const callGeminiWithRetry = async (fn, maxRetries = 3) => {
      let delay = 1000;
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch (err) {
          const isRetryable = err.message.includes("503") || err.message.includes("429");
          if (isRetryable && i < maxRetries - 1) {
            console.log(`Gemini busy (attempt ${i + 1}/${maxRetries}). Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
            continue;
          }
          throw err;
        }
      }
    };

    // Filter history to ensure it starts with a 'user' role (Gemini SDK requirement)
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg) }]
    }));

    // Find the first 'user' message index
    const firstUserIndex = formattedHistory.findIndex(h => h.role === 'user');
    const validHistory = firstUserIndex !== -1 ? formattedHistory.slice(firstUserIndex) : [];

    const chat = model.startChat({
      history: validHistory,
      generationConfig: { responseMimeType: "application/json" }
    });

    // Start of the ReAct Loop with retries
    let result = await callGeminiWithRetry(() => chat.sendMessage([
      { text: `SYSTEM: ${systemInstruction}` },
      { text: message }
    ]));
    
    let resultResponse = result.response;
    let call = resultResponse.functionCalls() ? resultResponse.functionCalls()[0] : null;

    // Handle Function Call
    while (call) {
      const toolResult = await localFetchBike(call.args.bikeName);
      
      result = await callGeminiWithRetry(() => chat.sendMessage([
        {
          functionResponse: {
            name: "fetch_bike_data",
            response: { content: toolResult }
          }
        }
      ]));
      
      resultResponse = result.response;
      call = resultResponse.functionCalls() ? resultResponse.functionCalls()[0] : null;
    }

    // Robust JSON parsing to handle extra text/markdown
    let rawText = resultResponse.text();
    try {
      // Find the first { and last } to extract ONLY the JSON object
      const start = rawText.indexOf('{');
      const end = rawText.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        rawText = rawText.substring(start, end + 1);
      }
      
      const finalJson = JSON.parse(rawText);
      res.json(finalJson);
    } catch (parseErr) {
      console.error("Parse Error. Raw text:", rawText);
      res.status(500).json({ 
        message: "AI returned invalid format", 
        reply: "Sorry, I had a calculation error. Could you try rephrasing that?" 
      });
    }

  } catch (err) {
    console.error("Agentic Error:", err.message);
    res.status(500).json({ message: "Agentic Error", error: err.message });
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
        "thumbnail": "https://image.pollinations.ai/prompt/Realistic%20photograph%20of%20a%20[NAME]%20[MODEL]%20motorcycle?width=800&height=450&nologo=true"
      }
      
      CRITICAL: In the "thumbnail" URL, you MUST replace [NAME] and [MODEL] with the actual bike name and model you generated. 
      The resulting URL must be valid and URL-encoded.
      
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
