import ReactMarkdown from "react-markdown";
import SourceCard from "./SourceCard";

function Message({ message }) {
  return (
    <div className={`message-row ${message.role === "user" ? "user-row" : "bot-row"}`}>
      <div className={`message-bubble ${message.role === "user" ? "user" : "bot"}`}>
        <div className="message-label">{message.role === "user" ? "👤" : "🤖"}</div>
        <div className="message-text">
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>

        {message.sources && (
          <div className="source-list">
            {message.sources.map((source, index) => (
              <SourceCard key={`${source.file}-${index}`} source={source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;
