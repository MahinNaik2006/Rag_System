import { useState } from "react";
import { askRAG } from "../api";
import Message from "./Message";

const suggestionQuestions = ["Explain OOP", "Inheritance", "Classes", "Interfaces"];

function formatAnswerForView(answer, selectedField, question) {
  const cleanedAnswer = (answer ?? "").replace(/\s+/g, " ").trim();

  if (!cleanedAnswer) return "";

  const compactAnswer = cleanedAnswer
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");

  if (selectedField === "title") {
    const topicTitle = (question ?? "").replace(/\?$/, "").trim() || "Topic";
    return compactAnswer ? `${topicTitle}\n\n${compactAnswer}` : topicTitle;
  }

  if (selectedField === "summary") {
    return compactAnswer || cleanedAnswer;
  }

  return cleanedAnswer;
}

function ChatBox({ messages, setMessages, onQuestionSubmit, onAnswerReady, selectedField }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(questionOverride) {
    const question = (questionOverride ?? input).trim();
    if (!question) return;

    onQuestionSubmit?.(question);
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const result = await askRAG(question);

      const botMessage = {
        role: "bot",
        text: formatAnswerForView(result.answer, selectedField, question),
        sources: result.sources,
      };

      setMessages((prev) => [...prev, botMessage]);
      onAnswerReady?.(result.answer, result.sources);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "❌ Backend error. Please make sure the local server is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat">
      <div className="messages">
        {messages.map((msg, index) => (
          <Message key={`${msg.role}-${index}`} message={msg} />
        ))}

        {loading && <div className="loading">Thinking with documents...</div>}
      </div>

      <div className="suggestions">
        <p className="suggestions-title">Suggested Questions</p>
        <div className="suggestion-chips">
          {suggestionQuestions.map((question) => (
            <button
              key={question}
              className="chip"
              type="button"
              onClick={() => send(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <div className="inputBox">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              send();
            }
          }}
          placeholder="Type your question..."
        />

        <button className="send-button" type="button" onClick={() => send()}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
