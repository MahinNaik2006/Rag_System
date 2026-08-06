import { useState, useEffect } from "react";

function DocumentQuiz({ document, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizSettings, setQuizSettings] = useState({
    num_questions: 5,
    difficulty: "medium",
    document_name: document?.name || ""
  });

  useEffect(() => {
    if (document) {
      setQuizSettings(prev => ({
        ...prev,
        document_name: document.name
      }));
      generateDocumentQuiz();
    }
  }, [document]);

  async function generateDocumentQuiz() {
    if (!document) return;
    
    setLoading(true);
    setError("");

    try {
      // First, get the document content to create context-specific questions
      const contentResponse = await fetch(`http://127.0.0.1:8000/document/${encodeURIComponent(document.name)}`);
      
      if (!contentResponse.ok) {
        throw new Error("Failed to load document content for quiz generation");
      }

      const contentData = await contentResponse.json();
      
      // Generate quiz questions based on this specific document
      const quizResponse = await fetch("http://127.0.0.1:8000/document-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...quizSettings,
          document_content: contentData.chunks.map(chunk => chunk.content).join('\n\n')
        }),
      });

      if (!quizResponse.ok) {
        throw new Error("Failed to generate document-specific quiz");
      }

      const quizData = await quizResponse.json();
      
      if (quizData.questions && quizData.questions.length > 0) {
        const formattedQuestions = quizData.questions.map((q, index) => ({
          ...q,
          id: q.id || index + 1,
          category: q.category || document.name
        }));
        
        setQuizQuestions(formattedQuestions);
        setStartTime(Date.now());
      } else {
        throw new Error("No questions were generated for this document.");
      }
    } catch (err) {
      console.error("Document quiz generation error:", err);
      setError(err.message || "Failed to generate quiz for this document.");
      
      // Fallback: create a basic quiz structure
      setQuizQuestions([{
        id: 1,
        question: `What is the main topic covered in "${document.name}"?`,
        options: [
          "Technical documentation",
          "Educational content", 
          "Business information",
          "General knowledge"
        ],
        correct: 0,
        explanation: `Based on the content in ${document.name}, this appears to be technical documentation. Review the document content to better understand its main themes.`,
        category: document.name
      }]);
      setStartTime(Date.now());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let interval;
    if (startTime && !showResults) {
      interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, showResults]);

  function handleAnswerSelect(questionId, answerIndex) {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  }

  function handleNext() {
    if (reviewMode) {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        exitReviewMode();
      }
    } else {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        finishQuiz();
      }
    }
  }

  function handlePrevious() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }

  function finishQuiz() {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
  }

  function calculateScore() {
    let correct = 0;
    quizQuestions.forEach(question => {
      if (selectedAnswers[question.id] === question.correct) {
        correct++;
      }
    });
    return correct;
  }

  function restartQuiz() {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setReviewMode(false);
    setScore(0);
    setTimeSpent(0);
    setStartTime(null);
    setError("");
    generateDocumentQuiz();
  }

  function enterReviewMode() {
    setReviewMode(true);
    setCurrentQuestion(0);
    setShowResults(false);
  }

  function exitReviewMode() {
    setReviewMode(false);
    setShowResults(true);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  const progress = quizQuestions.length > 0 ? ((currentQuestion + 1) / quizQuestions.length) * 100 : 0;
  const currentQ = quizQuestions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQ?.id];
  const isCorrectAnswer = selectedAnswer === currentQ?.correct;

  // Loading state
  if (loading) {
    return (
      <div className="document-quiz">
        <div className="quiz-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Document
          </button>
          <div className="quiz-title">
            <h2>🧠 Generating Quiz for "{document?.name}"</h2>
          </div>
        </div>
        <div className="quiz-loading">
          <div className="loading-spinner">⏳</div>
          <p>Creating questions based on document content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && quizQuestions.length === 0) {
    return (
      <div className="document-quiz">
        <div className="quiz-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Document
          </button>
          <div className="quiz-title">
            <h2>🧠 Quiz for "{document?.name}"</h2>
          </div>
        </div>
        <div className="quiz-error">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
          <div className="error-actions">
            <button className="retry-button" onClick={generateDocumentQuiz}>
              🔄 Try Again
            </button>
            <button className="back-button-alt" onClick={onBack}>
              ← Back to Document
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults && !reviewMode) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="document-quiz">
        <div className="quiz-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Document
          </button>
          <div className="quiz-title">
            <h2>📊 Quiz Results for "{document?.name}"</h2>
          </div>
        </div>

        <div className="quiz-results">
          <div className="results-header">
            <div className="results-score-circle">
              <div className={`score-ring ${passed ? 'passed' : 'failed'}`}>
                <span className="score-percentage">{percentage}%</span>
              </div>
            </div>
            <div className="results-info">
              <h3>{passed ? '🎉 Great Job!' : '📚 Keep Learning!'}</h3>
              <p>You scored {score} out of {quizQuestions.length} questions correctly</p>
              <p>Quiz based on: <strong>{document.name}</strong></p>
              <div className="results-stats">
                <div className="stat-item">
                  <span className="stat-label">Time Spent</span>
                  <span className="stat-value">{formatTime(timeSpent)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Accuracy</span>
                  <span className="stat-value">{percentage}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="results-actions">
            <button className="quiz-button primary" onClick={enterReviewMode}>
              📝 Review Answers
            </button>
            <button className="quiz-button secondary" onClick={restartQuiz}>
              🔄 Retake Quiz
            </button>
            <button className="quiz-button secondary" onClick={onBack}>
              📖 Back to Document
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz interface
  if (quizQuestions.length === 0) {
    return (
      <div className="document-quiz">
        <div className="quiz-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Document
          </button>
        </div>
        <div className="quiz-error">
          <h3>No questions available</h3>
          <button onClick={generateDocumentQuiz}>Try generating again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-quiz">
      <div className="quiz-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Document
        </button>
        
        <div className="quiz-progress-section">
          <div className="quiz-info">
            <h2>🧠 Quiz: {document?.name}</h2>
            <p>Test your knowledge of this specific document</p>
          </div>
          <div className="quiz-stats">
            <div className="stat">
              <span className="stat-label">Question</span>
              <span className="stat-value">{currentQuestion + 1} / {quizQuestions.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Time</span>
              <span className="stat-value">{formatTime(timeSpent)}</span>
            </div>
          </div>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-card">
          <div className="question-header">
            <span className="question-category">{currentQ.category}</span>
            <h3>Q{currentQuestion + 1}. {currentQ.question}</h3>
          </div>

          <div className="options-list">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQ.correct;
              const showFeedback = reviewMode && selectedAnswer !== undefined;

              let optionClass = 'option-button';
              if (isSelected) {
                optionClass += ' selected';
              }
              if (showFeedback) {
                if (isCorrect) {
                  optionClass += ' correct';
                } else if (isSelected && !isCorrect) {
                  optionClass += ' incorrect';
                }
              }

              return (
                <button
                  key={index}
                  className={optionClass}
                  onClick={() => handleAnswerSelect(currentQ.id, index)}
                  disabled={reviewMode}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                  {showFeedback && isCorrect && <span className="option-icon">✓</span>}
                  {showFeedback && isSelected && !isCorrect && <span className="option-icon">✗</span>}
                </button>
              );
            })}
          </div>

          {reviewMode && selectedAnswer !== undefined && (
            <div className={`explanation-card ${isCorrectAnswer ? 'correct' : 'incorrect'}`}>
              <div className="explanation-header">
                <span className="explanation-icon">
                  {isCorrectAnswer ? '✅' : '❌'}
                </span>
                <h4>{isCorrectAnswer ? 'Correct!' : 'Incorrect'}</h4>
              </div>
              <p>{currentQ.explanation}</p>
              {!isCorrectAnswer && (
                <p className="correct-answer">
                  <strong>Correct answer:</strong> {String.fromCharCode(65 + currentQ.correct)}. {currentQ.options[currentQ.correct]}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="quiz-navigation">
        <button 
          className="quiz-button secondary" 
          onClick={reviewMode ? (currentQuestion === 0 ? exitReviewMode : handlePrevious) : handlePrevious}
          disabled={!reviewMode && currentQuestion === 0}
        >
          {reviewMode ? (currentQuestion === 0 ? '← Back to Results' : '← Previous') : '← Previous'}
        </button>

        <div className="nav-center">
          {reviewMode ? (
            <span className="review-indicator">Review Mode - Question {currentQuestion + 1} of {quizQuestions.length}</span>
          ) : (
            <span className="question-counter">
              {Object.keys(selectedAnswers).length} / {quizQuestions.length} answered
            </span>
          )}
        </div>

        <button 
          className="quiz-button primary" 
          onClick={handleNext}
          disabled={!reviewMode && (!selectedAnswer && selectedAnswer !== 0)}
        >
          {reviewMode 
            ? (currentQuestion === quizQuestions.length - 1 ? 'Back to Results →' : 'Next →')
            : (currentQuestion === quizQuestions.length - 1 ? 'Finish Quiz →' : 'Next →')
          }
        </button>
      </div>
    </div>
  );
}

export default DocumentQuiz;