# owlai-playground
AI agents evaluation, i.e. assess agent performance against predefined criteria, to verify behavior, test regressions, and improve quality

# OwlAI Playground MVP

## Frontend
```bash
cd frontend
npm install
npm run dev

## Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn
uvicorn app.main:app --reload
