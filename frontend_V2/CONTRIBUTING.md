# Contributing to AI Tutor Frontend

Thank you for your interest in contributing to the AI Tutor project! 

## 🚀 Quick Start for Contributors

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd frontend_V2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development
```bash
npm run dev
```

## 📋 Development Requirements

- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version

## 🛠️ Development Workflow

### Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`

### Code Style
- Run linting: `npm run lint`
- Follow existing code patterns
- Use functional React components with hooks
- Keep components focused and reusable

### Testing
- Test all features manually
- Ensure responsive design works
- Verify API integration with backend
- Check error handling

### Submitting Changes
1. Commit your changes: `git commit -m "Add: your feature description"`
2. Push to your fork: `git push origin feature/your-feature-name`
3. Create a Pull Request

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ChatBox.jsx     # Main chat interface
│   ├── QuizPage.jsx    # Quiz functionality  
│   ├── UploadPage.jsx  # File upload
│   ├── Message.jsx     # Chat messages
│   └── SourceCard.jsx  # Source references
├── App.jsx             # Main application
├── App.css             # Global styles
├── api.js              # API utilities
└── main.jsx            # Entry point
```

## 🎯 Component Guidelines

### ChatBox Component
- Handles real-time messaging
- Integrates with backend API
- Manages message history
- Shows typing indicators

### QuizPage Component  
- Generates dynamic quizzes from uploaded docs
- Handles quiz settings and state
- Provides review and analytics
- Supports multiple question types

### UploadPage Component
- PDF file upload functionality
- File management interface
- Progress indicators
- Error handling

## 🔌 API Integration

The frontend communicates with a FastAPI backend:

```javascript
// Example API call pattern
const response = await fetch('http://127.0.0.1:8000/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### API Endpoints
- `POST /chat` - Send messages to AI
- `POST /upload` - Upload PDF documents  
- `GET /files` - List uploaded files
- `POST /quiz` - Generate quiz questions

## 🎨 Styling Guidelines

- Use CSS custom properties for theming
- Follow BEM-like naming conventions
- Ensure responsive design (mobile-first)
- Maintain consistent spacing and colors
- Use existing utility classes when possible

### Color Scheme
```css
/* Primary colors */
--bg-primary: #020617;
--bg-secondary: #0f172a; 
--bg-tertiary: #1e293b;

/* Accent colors */
--accent-blue: #2563eb;
--accent-purple: #8b5cf6;
--text-primary: #f8fafc;
--text-secondary: #cbd5e1;
```

## 🧪 Testing Checklist

### Before Submitting PR
- [ ] Code runs without errors
- [ ] All features work as expected  
- [ ] Responsive design is maintained
- [ ] API calls handle errors gracefully
- [ ] Loading states are implemented
- [ ] Accessibility is preserved
- [ ] ESLint passes (`npm run lint`)

### Manual Testing
- [ ] Chat functionality works
- [ ] File upload works
- [ ] Quiz generation works
- [ ] Quiz taking experience is smooth
- [ ] Results and review modes work
- [ ] Navigation between views works
- [ ] Mobile responsiveness works

## 🐛 Issue Reporting

When reporting bugs:
1. Describe the expected behavior
2. Describe the actual behavior  
3. Provide steps to reproduce
4. Include browser/OS information
5. Add screenshots if helpful

## 💡 Feature Requests

When suggesting features:
1. Explain the use case
2. Describe the proposed solution
3. Consider alternative approaches
4. Discuss potential implementation

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## 🤝 Code of Conduct

- Be respectful and constructive
- Help others learn and improve
- Focus on what's best for the project
- Welcome newcomers and diverse perspectives

---

Questions? Open an issue or start a discussion!