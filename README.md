# Read Documents AI

A production-quality AI-powered Multi-Document Research & Q&A Assistant built for Google Build with AI workshop.

## Tech Stack

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- App Router

### Backend
- FastAPI
- Python

### LLM
- Groq API
- Model: llama-3.3-70b-versatile

### PDF Parsing
- PyMuPDF

## Features

- Upload multiple PDF files via drag & drop or file picker
- Extract text from PDFs using PyMuPDF
- Ask questions about uploaded documents
- AI answers ONLY from uploaded documents (no hallucinations)
- Modern ChatGPT-style interface with dark theme
- Responsive design with glassmorphism effects
- Real-time typing indicators
- Toast notifications
- Chat history persistence during session
- Clear chat and clear documents functionality

## Project Structure

```
Read-Documents/
├── backend/
│   ├── main.py              # FastAPI application with all endpoints
│   ├── requirements.txt     # Python dependencies
│   └── venv/               # Virtual environment
└── frontend/
    ├── app/
    │   ├── globals.css     # Global styles and animations
    │   ├── layout.tsx      # Root layout
    │   └── page.tsx        # Main application page
    ├── package.json        # Node dependencies
    └── tsconfig.json       # TypeScript configuration
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
source venv/bin/activate  # On Linux/Mac
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set your Groq API key as an environment variable:
```bash
set GROQ_API_KEY=your_groq_api_key_here  # On Windows
export GROQ_API_KEY=your_groq_api_key_here  # On Linux/Mac
```

5. Run the backend server:
```bash
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set the backend API URL (optional, defaults to http://localhost:8000):
```bash
set NEXT_PUBLIC_API_URL=http://localhost:8000  # On Windows
export NEXT_PUBLIC_API_URL=http://localhost:8000  # On Linux/Mac
```

4. Run the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### GET /
Returns backend status
```json
{
  "message": "Backend Running"
}
```

### POST /upload
Accepts multiple PDF files
- Returns uploaded filenames
- Extracts text using PyMuPDF
- Stores text in memory

### POST /ask
Accepts a question in JSON format
```json
{
  "question": "What is the main topic of the documents?"
}
```
- Returns AI answer based on uploaded documents
- If information not found, clearly states it

### POST /clear
Clears all uploaded document text from memory

## Usage

1. Start both backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. Upload PDF files using drag & drop or the file picker
4. Ask questions about your documents in the chat interface
5. The AI will answer based only on the uploaded document content

## Design Features

- Dark theme with modern gradients
- Glassmorphism effects with backdrop blur
- Smooth animations and transitions
- Responsive layout (mobile-friendly)
- Professional typography
- Rounded cards and modern UI components
- Loading spinners and typing indicators
- Toast notifications for user feedback

## Notes

- No database used - documents stored in memory only
- No authentication - single-user application
- Files are not permanently stored
- External services limited to Groq API only
- No vector databases or AI frameworks used
