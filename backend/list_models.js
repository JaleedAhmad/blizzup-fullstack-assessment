const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const fetch = await import('node-fetch'); // Use fetch to list models or the SDK method
    // The SDK itself doesn't have a simple listModels on the main class usually, 
    // it's an API call.
    
    // We can use the REST API via curl or node-fetch
    const response = await fetch.default(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

listModels();
