# 🏍️ Blizzup Agentic Bike Dealership

A sophisticated, full-stack AI-driven bike dealership platform that leverages **Agentic AI** to provide deep technical comparisons, mathematical scoring, and automated inventory management.

---

## 🏗️ System Architecture

The core of the application is a **ReAct (Reason + Act)** agent loop built on Google Gemini. Unlike a traditional chatbot, this agent does not have the database in its prompt; it decides when to use tools to fetch real-world data.

```mermaid
graph TD
    User([User]) -- "Chat Message" --> UI[React Frontend]
    UI -- "API Request (State + History)" --> API[Express Backend]
    API -- "System Prompt" --> AI[Gemini 1.5/2.0 Flash]
    
    subgraph "Agentic Loop (ReAct)"
        AI -- "Reasoning: 'I need bike data'" --> Tool{Function Call}
        Tool -- "fetch_bike_data('Yamaha R1')" --> DB[(MongoDB / JSON)]
        DB -- "Bike Specs" --> Tool
        Tool -- "Observation: Specs for R1..." --> AI
    end
    
    AI -- "Final Verdict (JSON)" --> API
    API -- "Reply + Internal Thought + Data" --> UI
    UI -- "Render: Accordion + Table" --> User
```

---

## ✨ Key Features

### 1. Agentic AI Comparison
- **Strict 6-Step Flow**: The agent maintains a state machine (Greeting → Collection → Analysis → Scoring → Recommendation).
- **Function Calling**: Real-time database retrieval using specific tools.
- **Explainable AI**: transparent "Thinking Accordions" that show the AI's internal mathematical reasoning before the final verdict.

### 2. Intelligent Scoring System
- Automatic scoring across **5 mandatory metrics**:
  1. Price (20 pts)
  2. Fuel Average (20 pts)
  3. Engine Power (20 pts)
  4. Value for Money (20 pts)
  5. Features & Colors (20 pts)
- **High-Fidelity Table**: Dynamic comparison table with progress bars scaled to /20 per category.

### 3. Smart Inventory Management
- **AI Bulk Ingest**: Add multiple bikes by simply listing their names. The AI fetches specs and generates high-quality photographic prompts.
- **Vehicle Intelligence**: Distinguishes between Mountain Bikes and Superbikes to ensure accurate image generation.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vercel, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, Render, Mongoose.
- **AI/ML**: Google Gemini (via `@google/generative-ai`), Pollinations.ai (Image generation).
- **Database**: MongoDB Atlas.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- [Google AI Studio API Key](https://aistudio.google.com/)

### Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_google_ai_key
JWT_SECRET=your_jwt_secret
```

### Installation
1. **Clone the Repo**
2. **Setup Backend**
   ```bash
   cd backend
   npm install
   node server.js
   ```
3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🛡️ Administrative Features

### AI Image Repair
We included a self-healing utility to fix incorrect or low-quality thumbnails in the database. 
- **Endpoint**: `GET /api/bikes/admin/repair-images` (Used internally to refresh images to professional quality).
- **Duplicate Check**: The system automatically prevents the same bike/model combination from being added twice.

---

## 📝 Assessment Compliance
This project was built to fulfill the "Fullstack + AI Developer" assessment. It fulfills all mandatory requirements:
- [x] Responsive React UI
- [x] Node.js + MongoDB Backend
- [x] Real-time AI Tool Use (Function Calling)
- [x] Explainable Scoring (Step-by-step Math)
- [x] AI Bulk Ingest Feature

---
**Created by Antigravity for Blizzup Technologies.**
