import { useState } from "react";
import ChatBox from "./components/ChatBox";
import UploadPage from "./components/UploadPage";
import QuizPage from "./components/QuizPage";
import "./App.css";

function getCompactAnswer(text) {
  if (!text) return "";

  const cleaned = text.replace(/\s+/g, " ").trim();
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);

  return sentences.slice(0, 2).join(" ");
}

const initialMessages = [];
const recentTopics = [
  {
    id: "ml-basics",
    title: "Machine Learning Basics",
    description: "A simple overview of core machine learning ideas, training, and model evaluation.",
    tags: ["Beginner", "ML"],
  },
  {
    id: "vector-search",
    title: "Vector Search Concepts",
    description: "Learn how embeddings and similarity search power modern retrieval systems.",
    tags: ["RAG", "Search"],
  },
  {
    id: "prompt-engineering",
    title: "Prompt Engineering",
    description: "Discover techniques for writing prompts that guide the assistant effectively.",
    tags: ["Prompting", "AI"],
  },
];

const viewOptions = [
  { id: "overview", label: "Overview" },
  { id: "answer", label: "Answer" },
  { id: "chat", label: "Chat" },
  { id: "quiz", label: "Quiz" },
  { id: "upload", label: "Upload" },
];

function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [expanded, setExpanded] = useState(true);
  const [selectedField, setSelectedField] = useState("summary");
  const [answer, setAnswer] = useState("");
  const [references, setReferences] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("overview");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState(recentTopics[0].id);
  const [questionHistory, setQuestionHistory] = useState([]);

  const activeTopic = recentTopics.find((topic) => topic.id === selectedTopicId) || recentTopics[0];

  function startNewChat() {
    setMessages([]);
    setSelectedField("summary");
    setAnswer("");
    setReferences([]);
    setExpanded(true);
    setActiveView("overview");
    setSelectedTopicId(recentTopics[0].id);
  }

  function handleQuestionSubmit(question) {
    // Track the question when submitted
    const timestamp = new Date().toLocaleString();
    const newHistoryItem = {
      id: Date.now(),
      question: question,
      answer: "", // Will be filled when answer arrives
      timestamp: timestamp,
      references: []
    };
    
    setQuestionHistory(prev => [newHistoryItem, ...prev].slice(0, 10)); // Keep last 10 questions
  }

  function handleAnswerReady(responseAnswer, responseSources, question) {
    setAnswer(responseAnswer);
    setReferences(responseSources || []);
    
    // Update the most recent question history item with the answer
    setQuestionHistory(prev => 
      prev.map((item, index) => 
        index === 0 ? { ...item, answer: responseAnswer, references: responseSources || [] } : item
      )
    );
  }

  function handleFileUpload(fileName) {
    setUploadedFileName(fileName);
    setActiveView("upload");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">🤖</div>
          <div>
            <div className="brand">AI Tutor</div>
            <div className="brand-subtitle">Grounded answers for every question</div>
          </div>
        </div>

        <nav className="top-nav" aria-label="Primary navigation">
          {viewOptions.map((view) => (
            <button
              key={view.id}
              type="button"
              className={`nav-button ${activeView === view.id ? "active" : ""}`}
              onClick={() => setActiveView(view.id)}
            >
              {view.id === "upload" && uploadedFileName ? `Upload · ${uploadedFileName}` : view.label}
            </button>
          ))}
        </nav>

        <button className="ghost-button" onClick={startNewChat}>
          ✨ New Chat
        </button>
      </header>

      <main className={`content-panel ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        <button
          className={`sidebar-toggle ${sidebarOpen ? "open" : "closed"}`}
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? "←" : "→"}
        </button>

        <aside className={`sidebar ${sidebarOpen ? "visible" : "hidden"}`}>
          <div className="sidebar-card">
            <h3>Study mode</h3>
            <p>Switch between title, description, and summary views to tailor how the answer is presented.</p>
          </div>

          <div className="sidebar-card">
            <h3>Practice & Learn</h3>
            <p>Generate custom quizzes from your uploaded documents or practice with default AI/RAG questions.</p>
            <button 
              className="sidebar-topic-button"
              onClick={() => setActiveView("quiz")}
            >
              🧠 Start Quiz
            </button>
          </div>

          <div className="sidebar-card accent-card">
            <h3>Tip</h3>
            <p>Use the quiz to practice and review your answers. Upload documents to ask specific questions about your content.</p>
          </div>
        </aside>

        <div className="main-content">
          {activeView === "overview" && (
            <>
              <section className="topic-card" id="overview">
                {expanded && (
                  <div className="topic-body">
                    <h2>Choose the response mode</h2>
                    <p>Switch between different ways of reading the answer before you ask a follow-up question.</p>

                    <div className="mode-switcher" role="tablist" aria-label="Response modes">
                      {[
                        { value: "title", label: "Title" },
                        { value: "description", label: "Description" },
                        { value: "summary", label: "Summary" },
                      ].map((mode) => (
                        <button
                          key={mode.value}
                          type="button"
                          className={`mode-chip ${selectedField === mode.value ? "active" : ""}`}
                          onClick={() => setSelectedField(mode.value)}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <div className="answer-card">
                <h3>Latest answer preview</h3>
                <p>
                  {answer
                    ? getCompactAnswer(answer)
                    : "Ask a question to generate a grounded response from the available documents."}
                </p>
              </div>
            </>
          )}

          {activeView === "answer" && (
            <div className="answer-page" id="answer">
              <div className="answer-header">
                <h2>Answer History</h2>
                <p>Recent questions and answers from your chat sessions</p>
              </div>

              {questionHistory.length > 0 ? (
                <div className="answers-grid">
                  {questionHistory.slice(0, 4).map((item) => (
                    <div className="answer-history-card" key={item.id}>
                      <div className="answer-card-header">
                        <h3>{item.question}</h3>
                        <div className="answer-meta-info">
                          <span className="answer-timestamp">{item.timestamp}</span>
                        </div>
                      </div>
                      <div className="answer-content">
                        <p>{item.answer ? getCompactAnswer(item.answer) : "Loading answer..."}</p>
                        {item.references && item.references.length > 0 && (
                          <div className="mini-references">
                            <small>{item.references.length} reference{item.references.length !== 1 ? 's' : ''}</small>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-history">
                  <div className="no-history-content">
                    <h3>No Questions Asked Yet</h3>
                    <p>Start a conversation in the Chat tab to see your question history here.</p>
                    <button 
                      className="start-chat-button" 
                      onClick={() => setActiveView("chat")}
                    >
                      Go to Chat
                    </button>
                  </div>
                </div>
              )}

              <div className="current-answer-section">
                <h3>Current Session Answer</h3>
                <div className="answer-card">
                  <p>{answer || "No answer yet. Start a chat to prompt the assistant."}</p>

                  {answer && (
                    <div className="answer-meta">
                      <span>Current mode: {selectedField}</span>
                      <span>References loaded: {references.length}</span>
                    </div>
                  )}

                  {references.length > 0 && (
                    <div className="reference-list">
                      {references.map((source, index) => (
                        <div className="reference-item" key={`${source.file || "source"}-${index}`}>
                          <strong>{source.file || "Referenced document"}</strong>
                          <span>{source.score ? `Score: ${source.score}` : "Relevant content"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === "chat" && (
            <div className="chat-panel" id="chat">
              <ChatBox
                messages={messages}
                setMessages={setMessages}
                onQuestionSubmit={handleQuestionSubmit}
                selectedField={selectedField}
                onAnswerReady={handleAnswerReady}
              />
            </div>
          )}

          {activeView === "quiz" && <QuizPage />}

          {activeView === "upload" && <UploadPage onUpload={handleFileUpload} uploadedFileName={uploadedFileName} />}
        </div>
      </main>
    </div>
  );
}

export default App;
