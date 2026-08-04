# AI Tutor - RAG Frontend V2

An interactive AI tutoring application with RAG (Retrieval Augmented Generation) capabilities, featuring document upload, intelligent Q&A, and knowledge assessment through quizzes.

## Features

###  AI Chat Interface
- Interactive chat with an AI tutor that provides grounded answers
- Upload PDF documents to create a knowledge base
- Real-time responses with source references
- Question history tracking

###  Knowledge Quiz
- Interactive quiz with questions about AI, RAG systems, and machine learning
- **Dynamic question generation** from uploaded documents using backend AI
- **Customizable settings** for number of questions (5-20) and difficulty level
- Multiple choice questions with detailed explanations
- Progress tracking and performance analytics
- Review mode to go through answers and explanations
- Category-based performance breakdown
- **Fallback to default questions** when no documents are available

###  Document Management
- Upload PDF files to build your knowledge base
- View uploaded documents with file information
- Document chunking and indexing for optimal retrieval

###  Answer Analytics
- View recent questions and answers
- Track response accuracy and sources
- Historical answer review

## Getting Started

### 🚀 Automated Setup

**Windows Users:**
```bash
# Run the setup script
install.bat
```

**Mac/Linux Users:**
```bash
# Make script executable and run
chmod +x install.sh
./install.sh
```

**Manual Setup:**
```bash
npm install && npm run dev
```

### 📋 Detailed Setup
For step-by-step instructions, see [SETUP.md](SETUP.md)

### Prerequisites
- Node.js (v16 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js) or yarn package manager
- Git (for cloning the repository)

### Quick Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/MahinNaik2006/Rag_System.git
   cd frontend_V2
   ```

2. **Install all dependencies**
   ```bash
   npm install
   ```
   *This will automatically install all required packages listed in package.json*

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run code linting
```

### Backend Setup
This frontend connects to a FastAPI backend. Make sure you have the backend running on `http://127.0.0.1:8000`

## Troubleshooting

### Common Issues
1. **Port already in use**: If port 5173 is busy, Vite will automatically use the next available port
2. **Node version**: Make sure you're using Node.js v16 or higher (`node --version`)
3. **Dependencies**: Delete `node_modules` and run `npm install` again if you encounter package issues
4. **Backend connection**: Ensure your backend API is running on port 8000

### Package Dependencies
All required packages are automatically installed via `npm install`. No manual dependency management needed!

**Main Dependencies:**
- React 19.2.7 - UI framework
- Vite 8.1.1 - Build tool and dev server  
- Axios 1.18.1 - HTTP client for API calls
- React Markdown 10.1.0 - Markdown rendering

**Development Dependencies:**
- ESLint - Code linting
- Vite React Plugin - React support for Vite

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5173 in your browser

### Build for Production
```bash
npm run build
```

## Tech Stack
- React 18 with functional components and hooks
- Vite for fast development and building
- CSS with custom styling (no external UI library dependencies)
- Axios for API communication

## Project Structure
```
src/
├── components/
│   ├── ChatBox.jsx      # Main chat interface
│   ├── Message.jsx      # Individual message components
│   ├── QuizPage.jsx     # Interactive quiz functionality
│   ├── SourceCard.jsx   # Source reference display
│   └── UploadPage.jsx   # Document upload interface
├── App.jsx              # Main application component
├── App.css              # Global styles
└── main.jsx             # Application entry point
```

## API Integration
The frontend expects a backend API with the following endpoints:
- `POST /upload` - Document upload
- `GET /files` - List uploaded documents  
- `POST /chat` - Chat with AI tutor
- `POST /quiz` - Generate custom quiz questions from uploaded documents

## Quiz Features
The quiz includes questions covering:
- AI Fundamentals
- RAG Architecture  
- Machine Learning concepts
- Prompt Engineering
- Document Processing
- Vector Search

Quiz features:
-  **Dynamic question generation** from uploaded study materials
-  **Configurable settings** (5-20 questions, easy/medium/hard difficulty)
-  Progress tracking with visual indicators
-  Real-time scoring and performance analytics
-  Detailed explanations for each answer
-  Review mode to study incorrect answers
-  Category-based performance breakdown
-  **Fallback to default AI/RAG questions** when no documents are uploaded
-  Responsive design for mobile and desktop

---

## 📁 Setup Files

- **`package.json`** - Contains all required dependencies (main requirements file)
- **`SETUP.md`** - Detailed setup instructions
- **`install.bat`** - Automated setup script for Windows
- **`install.sh`** - Automated setup script for Mac/Linux  
- **`.nvmrc`** - Specifies Node.js version (18.19.0)
- **`CONTRIBUTING.md`** - Guidelines for contributors

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
