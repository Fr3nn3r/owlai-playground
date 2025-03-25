
# 🦉 OwlAI Playground

A simple and extensible web interface for evaluating AI agents specialized in French law, powered by a RAG (Retrieval-Augmented Generation) backend.

---

## 📁 Project Structure

```
owlai-playground/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app with agent list and query endpoints
│   │   └── data/
│   │       └── agents.py   # Mock agent data
│   ├── tests/
│   │   ├── test_agents.py  # Unit tests for /agents endpoint
│   │   └── test_query.py   # Unit tests for /query endpoint
│   ├── venv/               # Python virtual environment (ignored)
│   └── requirements.txt    # Backend dependencies
│
├── frontend/               # React frontend using Vite + Tailwind
│   ├── public/
│   │   └── owl-default.jpg # Default owl image (can be per-agent)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentSelector.jsx   # Dropdown to select an agent
│   │   │   ├── QuestionInput.jsx   # Text area for entering the legal question
│   │   │   └── ResponseDisplay.jsx # Component that displays the agent's response
│   │   ├── App.jsx         # Main app component
│   │   └── index.css       # Tailwind CSS setup
│   ├── package.json        # Frontend dependencies and scripts
│   └── tailwind.config.js  # Tailwind configuration
│
├── .gitignore              # Ignores node_modules, venv, etc.
└── README.md               # Project overview and setup instructions
```

---

## 🚀 How to Run It Locally

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt

# Or manually install
pip install fastapi uvicorn httpx

# Run the server
uvicorn app.main:app --reload
```

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install

# Start the development server
npm run dev
```

Frontend runs at: `http://localhost:5173`  
Backend runs at: `http://localhost:8000`

---

## ✨ Features

- 📝 Ask legal questions to a selected AI agent
- 🤖 Dynamically fetch agent list from backend
- 🎨 Clean and responsive UI (with pink theme!)
- 🦉 Owl avatar image per agent (default provided)
- 🧪 Unit tests for backend endpoints
- ⚠️ Error and loading state handling

---

## ✅ API Overview

### `GET /agents`
Returns a list of available agents.

```json
[
  { "id": "agent1", "name": "Agent Alpha", "description": "Civil law specialist" }
]
```

### `POST /query`
Send a question and an agent ID.

**Request Body:**

```json
{
  "question": "What is Article 1382?",
  "agent_id": "agent1"
}
```

**Response:**

```json
{
  "agent_id": "agent1",
  "question": "What is Article 1382?",
  "answer": "This is a mock answer to: 'What is Article 1382?' from agent 'agent1'."
}
```

---

## 🧪 Run Tests (Backend)

```bash
cd backend
venv\Scripts\activate  # On Windows
pytest
```

---

## 🔮 Roadmap

- Deploy frontend and backend to the cloud
- Add feedback capture (👍👎)
- Support multiple owl avatars (per agent)
- Add agent comparison view
- Save query history per user

---

## 🧠 Credits

Made with ❤️ for legal tech innovation and adorable owls.
