import { useState, useEffect } from "react";

const defaultQuizQuestions = [
  {
    id: 1,
    question: "What does RAG stand for in AI context?",
    options: [
      "Retrieval Augmented Generation",
      "Rapid Application Growth", 
      "Random Access Gateway",
      "Real-time Analytics Generator"
    ],
    correct: 0,
    explanation: "RAG stands for Retrieval Augmented Generation, which combines information retrieval with text generation to provide more accurate and contextual responses.",
    category: "AI Fundamentals"
  },
  {
    id: 2,
    question: "Which of the following is a key component of a RAG system?",
    options: [
      "Vector database",
      "Image classifier", 
      "Audio processor",
      "Video encoder"
    ],
    correct: 0,
    explanation: "Vector databases store document embeddings that can be searched for similarity matching, which is essential for the retrieval part of RAG.",
    category: "RAG Architecture"
  },
  {
    id: 3,
    question: "What is the primary purpose of embeddings in machine learning?",
    options: [
      "To compress images",
      "To convert text into numerical representations",
      "To encrypt data",
      "To optimize database queries"
    ],
    correct: 1,
    explanation: "Embeddings convert text (or other data) into dense numerical vectors that capture semantic meaning, enabling similarity comparisons and machine learning operations.",
    category: "Machine Learning"
  },
  {
    id: 4,
    question: "In prompt engineering, what is 'few-shot learning'?",
    options: [
      "Training with limited data",
      "Providing examples in the prompt",
      "Using short prompts only",
      "Learning in a few seconds"
    ],
    correct: 1,
    explanation: "Few-shot learning in prompting means providing a few examples in the prompt to help the AI understand the desired output format and behavior.",
    category: "Prompt Engineering"
  },
  {
    id: 5,
    question: "What is chunking in the context of document processing for RAG?",
    options: [
      "Compressing files to save space",
      "Breaking documents into smaller, manageable pieces",
      "Encrypting sensitive content",
      "Converting text to images"
    ],
    correct: 1,
    explanation: "Chunking breaks large documents into smaller sections that can be individually embedded and retrieved, improving the precision of information retrieval.",
    category: "Document Processing"
  },
  {
    id: 6,
    question: "Which similarity metric is commonly used for vector search?",
    options: [
      "Euclidean distance",
      "Cosine similarity", 
      "Hamming distance",
      "All of the above"
    ],
    correct: 3,
    explanation: "Multiple similarity metrics can be used for vector search, including Euclidean distance, cosine similarity, and others, depending on the use case and data characteristics.",
    category: "Vector Search"
  }
];

function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizSettings, setQuizSettings] = useState({
    num_questions: 6,
    difficulty: "medium"
  });
  const [showSettings, setShowSettings] = useState(true);

  async function generateQuiz() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizSettings),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();
      
      if (data.questions && data.questions.length > 0) {
        // Add IDs if not present and ensure correct format
        const formattedQuestions = data.questions.map((q, index) => ({
          ...q,
          id: q.id || index + 1,
          category: q.category || "Study Material"
        }));
        
        setQuizQuestions(formattedQuestions);
        setShowSettings(false);
        setStartTime(Date.now());
      } else {
        throw new Error("No questions generated. Please upload study materials first.");
      }
    } catch (err) {
      console.error("Quiz generation error:", err);
      setError(err.message || "Failed to generate quiz. Using default questions.");
      // Fallback to default questions
      setQuizQuestions(defaultQuizQuestions);
      setShowSettings(false);
      setStartTime(Date.now());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!startTime && !showResults && !showSettings) {
      setStartTime(Date.now());
    }
  }, [startTime, showResults, showSettings]);

  useEffect(() => {
    let interval;
    if (startTime && !showResults && !showSettings) {
      interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, showResults, showSettings]);

  function handleAnswerSelect(questionId, answerIndex) {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  }

  function handleNext() {
    if (reviewMode) {
      // In review mode, just navigate to next question or back to results
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        exitReviewMode(); // Return to results when at last question
      }
    } else {
      // In quiz mode, normal behavior
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
    setQuizCompleted(true);
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
    setQuizCompleted(false);
    setReviewMode(false);
    setScore(0);
    setTimeSpent(0);
    setStartTime(null);
    setQuizQuestions([]);
    setShowSettings(true);
    setError("");
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

  // Quiz Settings Screen
  if (showSettings) {
    return (
      <div className="quiz-page">
        <div className="quiz-settings-card">
          <div className="settings-header">
            <h2>🧠 Generate Custom Quiz</h2>
            <p>Create questions based on your uploaded study materials</p>
          </div>

          <div className="settings-form">
            <div className="setting-group">
              <label htmlFor="num-questions" className="setting-label">
                Number of Questions
              </label>
              <select
                id="num-questions"
                className="setting-select"
                value={quizSettings.num_questions}
                onChange={(e) => setQuizSettings(prev => ({
                  ...prev,
                  num_questions: parseInt(e.target.value)
                }))}
              >
                <option value={5}>5 Questions</option>
                <option value={6}>6 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            <div className="setting-group">
              <label htmlFor="difficulty" className="setting-label">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                className="setting-select"
                value={quizSettings.difficulty}
                onChange={(e) => setQuizSettings(prev => ({
                  ...prev,
                  difficulty: e.target.value
                }))}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="settings-actions">
            <button 
              className="quiz-button primary"
              onClick={generateQuiz}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner">⏳</span>
                  Generating Quiz...
                </>
              ) : (
                "Generate Quiz from Study Materials"
              )}
            </button>

            <button 
              className="quiz-button secondary"
              onClick={() => {
                setQuizQuestions(defaultQuizQuestions);
                setShowSettings(false);
                setStartTime(Date.now());
              }}
            >
              Use Default AI/RAG Questions
            </button>
          </div>

          <div className="settings-info">
            <div className="info-card">
              <h4>📚 How it works</h4>
              <ul>
                <li>Questions are generated from your uploaded PDF documents</li>
                <li>The AI creates questions based on the content in your knowledge base</li>
                <li>If no documents are uploaded, default AI/RAG questions will be used</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && !reviewMode) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="quiz-page">
        <div className="quiz-results">
          <div className="results-header">
            <div className="results-score-circle">
              <div className={`score-ring ${passed ? 'passed' : 'failed'}`}>
                <span className="score-percentage">{percentage}%</span>
              </div>
            </div>
            <div className="results-info">
              <h2>{passed ? '🎉 Great Job!' : '📚 Keep Learning!'}</h2>
              <p>You scored {score} out of {quizQuestions.length} questions correctly</p>
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
              🔄 New Quiz
            </button>
          </div>

          <div className="category-breakdown">
            <h3>Performance by Category</h3>
            <div className="category-grid">
              {Array.from(new Set(quizQuestions.map(q => q.category))).map(category => {
                const categoryQuestions = quizQuestions.filter(q => q.category === category);
                const categoryScore = categoryQuestions.reduce((acc, q) => {
                  return acc + (selectedAnswers[q.id] === q.correct ? 1 : 0);
                }, 0);
                const categoryPercentage = Math.round((categoryScore / categoryQuestions.length) * 100);

                return (
                  <div key={category} className="category-card">
                    <h4>{category}</h4>
                    <div className="category-progress">
                      <div 
                        className="category-progress-bar" 
                        style={{ width: `${categoryPercentage}%` }}
                      ></div>
                    </div>
                    <span className="category-score">
                      {categoryScore}/{categoryQuestions.length} ({categoryPercentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no questions are loaded, show error state
  if (quizQuestions.length === 0 && !showSettings) {
    return (
      <div className="quiz-page">
        <div className="quiz-settings-card">
          <div className="settings-header">
            <h2>❌ No Questions Available</h2>
            <p>Unable to load quiz questions. Please try again or use default questions.</p>
          </div>
          <div className="settings-actions">
            <button className="quiz-button primary" onClick={restartQuiz}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <div className="quiz-progress-section">
          <div className="quiz-info">
            <h2>AI & RAG Knowledge Quiz</h2>
            <p>
              {quizQuestions === defaultQuizQuestions 
                ? "Test your understanding of AI concepts, RAG systems, and related technologies" 
                : "Test your knowledge based on your uploaded study materials"}
            </p>
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

export default QuizPage;