function SourceCard({ source }) {
  return (
    <div className="source-card">
      <div className="source-icon">📄</div>
      <div className="source-details">
        <p>{source.file}</p>
        <span>{source.page}</span>
        <small>{source.topic}</small>
        <strong>{(source.score * 100).toFixed(0)}% match</strong>
      </div>
    </div>
  );
}

export default SourceCard;