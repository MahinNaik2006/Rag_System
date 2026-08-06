import { useState, useEffect, useRef } from "react";

function VideoViewer({ document, onBack, onQuizMe }) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedChunk, setExpandedChunk] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [videoError, setVideoError] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    if (document) {
      loadVideoContent();
      loadVideoInfo();
    }
  }, [document]);

  async function loadVideoContent() {
    setLoading(true);
    setError("");

    try {
      // Get video transcript chunks from the database via API
      const response = await fetch(`http://127.0.0.1:8000/document/${encodeURIComponent(document.name)}`);
      
      if (!response.ok) {
        throw new Error("Failed to load video content");
      }

      const data = await response.json();
      console.log('Video content loaded:', data); // Debug log
      setContent(data.chunks || []);

    } catch (err) {
      console.error("Failed to load video content:", err);
      setError(err.message);
      
      // Fallback: show basic video info
      setContent([{
        id: 1,
        content: `Video: ${document.name}\n\nTranscript not available. You can still take a quiz based on this video's content in the knowledge base.`,
        page_number: 1,
        chunk_index: 0
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function loadVideoInfo() {
    try {
      const response = await fetch(`http://127.0.0.1:8000/video-info/${encodeURIComponent(document.name)}`);
      
      if (response.ok) {
        const info = await response.json();
        setVideoInfo(info);
      }
    } catch (err) {
      console.error("Failed to load video info:", err);
    }
  }

  function getVideoUrl() {
    return `http://127.0.0.1:8000/video/${encodeURIComponent(document.name)}`;
  }

  function formatDuration(seconds) {
    if (!seconds || seconds === 0) return "Unknown duration";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function toggleChunkExpansion(chunkId) {
    setExpandedChunk(expandedChunk === chunkId ? null : chunkId);
  }

  function handleVideoError() {
    setVideoError("Unable to load video. The file format may not be supported by your browser.");
  }

  if (!document) {
    return (
      <div className="video-viewer">
        <div className="viewer-error">
          <h2>No video selected</h2>
          <button className="back-button" onClick={onBack}>
            ← Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-viewer">
      {/* Header */}
      <div className="viewer-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Library
        </button>
        
        <div className="video-header-info">
          <div className="video-title-section">
            <span className="video-icon-large">🎬</span>
            <div>
              <h1>{document.name}</h1>
              <p className="video-meta">
                {formatFileSize(document.size)}
                {videoInfo && videoInfo.duration > 0 && (
                  <> • {formatDuration(videoInfo.duration)}</>
                )}
                {videoInfo && videoInfo.width > 0 && videoInfo.height > 0 && (
                  <> • {videoInfo.width}x{videoInfo.height}</>
                )}
              </p>
            </div>
          </div>
          
          <button 
            className="quiz-me-button primary"
            onClick={() => onQuizMe && onQuizMe(document)}
          >
            🧠 Quiz Me on This Video
          </button>
        </div>
      </div>

      {/* Video Player */}
      <div className="video-player-section">
        <div className="video-player-container">
          <video 
            ref={videoRef}
            className="video-player"
            controls
            preload="metadata"
            onError={handleVideoError}
          >
            <source src={getVideoUrl()} />
            Your browser does not support the video tag.
          </video>
          
          {videoError && (
            <div className="video-error">
              <p>⚠️ {videoError}</p>
              <p>You can still view the transcript below and take a quiz on the content.</p>
            </div>
          )}
        </div>

        {videoInfo && (
          <div className="video-info-panel">
            <h3>📊 Video Information</h3>
            <div className="video-stats">
              <div className="stat-item">
                <span className="stat-label">Duration:</span>
                <span className="stat-value">{formatDuration(videoInfo.duration)}</span>
              </div>
              {videoInfo.width > 0 && videoInfo.height > 0 && (
                <div className="stat-item">
                  <span className="stat-label">Resolution:</span>
                  <span className="stat-value">{videoInfo.width}x{videoInfo.height}</span>
                </div>
              )}
              {videoInfo.fps > 0 && (
                <div className="stat-item">
                  <span className="stat-label">Frame Rate:</span>
                  <span className="stat-value">{videoInfo.fps.toFixed(1)} fps</span>
                </div>
              )}
              <div className="stat-item">
                <span className="stat-label">File Size:</span>
                <span className="stat-value">{formatFileSize(document.size)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transcript Content */}
      <div className="video-content">
        {loading && (
          <div className="loading-content">
            <div className="loading-spinner">🎬</div>
            <p>Loading video transcript...</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-content">
            <h2>❌ Error Loading Transcript</h2>
            <p>{error}</p>
            <button className="retry-button" onClick={loadVideoContent}>
              🔄 Try Again
            </button>
          </div>
        )}

        {!loading && content.length > 0 && (
          <div className="content-sections">
            <div className="content-header">
              <h2>📝 Video Transcript</h2>
              <p>Review the transcript below while watching the video, then test your knowledge with a quiz!</p>
            </div>

            {content.map((chunk, index) => (
              <div key={`chunk-${index}`} className="content-chunk">
                <div className="chunk-header">
                  <h3>
                    Segment {index + 1}
                    {chunk.title && chunk.title !== document.name && (
                      <span className="chunk-title"> - {chunk.title}</span>
                    )}
                  </h3>
                  <button 
                    className="expand-button"
                    onClick={() => toggleChunkExpansion(index)}
                  >
                    {expandedChunk === index ? '📖 Collapse' : '📖 Expand'}
                  </button>
                </div>
                
                {/* Show full content when expanded, preview when collapsed */}
                {expandedChunk === index ? (
                  <div className="chunk-content-full">
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {chunk.content || 'No transcript content available for this segment.'}
                    </p>
                  </div>
                ) : (
                  <div className="chunk-preview">
                    <p>
                      {chunk.content 
                        ? (chunk.content.substring(0, 200) + (chunk.content.length > 200 ? '...' : ''))
                        : 'No preview available - click Expand to view transcript.'
                      }
                    </p>
                    <small className="preview-hint">Click "Expand" to see full transcript segment</small>
                  </div>
                )}
              </div>
            ))}

            {/* Quiz CTA */}
            <div className="quiz-cta-section">
              <div className="quiz-cta-card">
                <div className="quiz-cta-content">
                  <h3>🎯 Ready to Test Your Knowledge?</h3>
                  <p>
                    Now that you've watched the video and reviewed the transcript, take a quiz to see how much you've learned!
                  </p>
                  <button 
                    className="quiz-cta-button"
                    onClick={() => onQuizMe && onQuizMe(document)}
                  >
                    🧠 Start Quiz on "{document.name}"
                  </button>
                </div>
                <div className="quiz-cta-features">
                  <div className="feature-item">
                    ✅ Questions generated from video transcript
                  </div>
                  <div className="feature-item">
                    ✅ Test your video comprehension
                  </div>
                  <div className="feature-item">
                    ✅ Get detailed explanations
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && content.length === 0 && (
          <div className="empty-content">
            <div className="empty-content-message">
              <div className="empty-content-icon">🎬</div>
              <h3>No transcript available</h3>
              <p>This video may not have been processed yet, or the transcript couldn't be extracted.</p>
              <button 
                className="quiz-fallback-button"
                onClick={() => onQuizMe && onQuizMe(document)}
              >
                🧠 Try Quiz Anyway
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoViewer;