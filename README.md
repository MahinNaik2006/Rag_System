# RAG System

A Retrieval-Augmented Generation (RAG) system with Python backend and React frontend for document-based question answering.

## Project Structure

This repository contains two main components:

### 🐍 Python_V2 (Backend)
- **Backend API**: Flask-based REST API for document processing and chat
- **Document Processing**: PDF ingestion and text extraction
- **Vector Database**: Embedding-based document search
- **Chat System**: RAG-powered conversational AI

### ⚛️ frontend_V2 (Frontend) 
- **React Application**: Modern UI built with Vite
- **Chat Interface**: Real-time messaging with the backend
- **Document Upload**: Easy PDF document management
- **Quiz System**: Interactive Q&A functionality

## Features

- 📄 **PDF Document Ingestion**: Upload and process PDF documents
- 🔍 **Semantic Search**: Vector-based document retrieval
- 💬 **Interactive Chat**: Ask questions about your documents
- 🧪 **Quiz Generation**: Create quizzes from document content
- 🎨 **Modern UI**: Clean, responsive React interface

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup (Python_V2)
```bash
cd Python_V2
python -m venv .venv
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
python app.py
```

### Frontend Setup (frontend_V2)
```bash
cd frontend_V2
npm install
npm run dev
```

## Usage

1. Start the Python backend server
2. Launch the React frontend application  
3. Upload PDF documents through the web interface
4. Start chatting with your documents!

## Technologies Used

**Backend:**
- Python
- Flask
- Vector Embeddings
- PDF Processing Libraries

**Frontend:** 
- React
- Vite
- Modern CSS
- REST API Integration

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

This project is open source and available under the [MIT License](LICENSE).