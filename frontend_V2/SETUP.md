# 🚀 Quick Setup Guide

This guide will help you get the AI Tutor frontend up and running in minutes.

## ⚡ One-Command Setup

```bash
# Clone, install, and run
git clone https://github.com/MahinNaik2006/Rag_System.git && cd frontend_V2 && npm install && npm run dev
```

## 📋 Step-by-Step Setup

### 1. Prerequisites Check
Make sure you have these installed:
- **Node.js v16+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

Check your versions:
```bash
node --version  # Should be v16 or higher
npm --version   # Should be 8 or higher
git --version
```

### 2. Clone Repository
```bash
git clone https://github.com/MahinNaik2006/Rag_System.git
cd frontend_V2
```

### 3. Install Dependencies
```bash
npm install
```
*This installs all packages listed in package.json automatically*

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open in Browser
- Navigate to: `http://localhost:5173`
- Or use the URL shown in your terminal

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |

## 🏗️ Project Structure

```
frontend_V2/
├── src/
│   ├── components/       # React components
│   │   ├── ChatBox.jsx   # Main chat interface
│   │   ├── QuizPage.jsx  # Quiz functionality
│   │   ├── UploadPage.jsx # File upload
│   │   └── ...
│   ├── App.jsx          # Main app component
│   ├── App.css          # Global styles
│   └── main.jsx         # Entry point
├── public/              # Static assets
├── package.json         # Dependencies & scripts
└── vite.config.js       # Build configuration
```

## 🔌 Backend Connection

This frontend expects a FastAPI backend running on:
- **URL**: `http://127.0.0.1:8000`
- **Endpoints**: `/chat`, `/upload`, `/files`, `/quiz`

Make sure your backend is running before using the app.

## 🐛 Troubleshooting

### Port Issues
- If port 5173 is busy, Vite uses the next available port
- Check terminal output for the actual URL

### Dependency Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Node Version Issues
- Use Node.js v16 or higher
- Consider using nvm: `nvm use` (if .nvmrc exists)

### Backend Connection Issues
- Ensure backend is running on port 8000
- Check browser console for CORS errors
- Verify API endpoints are accessible

## 📦 Dependencies Explained

### Runtime Dependencies
- **React**: UI framework for building the interface
- **Axios**: HTTP client for API communication
- **React Markdown**: Renders markdown content in messages

### Development Dependencies
- **Vite**: Fast build tool and dev server
- **ESLint**: Code quality and consistency
- **React Plugin**: Enables React support in Vite

## 🎯 Next Steps

1. **Upload Documents**: Use the Upload tab to add PDF files
2. **Start Chatting**: Ask questions about your documents
3. **Take Quizzes**: Generate custom quizzes from your content
4. **Review Answers**: Study explanations and improve understanding

## 💡 Tips

- Keep the backend server running while using the app
- Upload PDF documents first for best quiz experience
- Use the Chat feature to ask specific questions
- Review quiz explanations to learn concepts

---

**Need Help?** Check the main README.md for detailed feature documentation.