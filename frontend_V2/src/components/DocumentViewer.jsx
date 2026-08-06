import { useState, useEffect } from "react";

function DocumentViewer({ document, onBack, onQuizMe }) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedChunk, setExpandedChunk] = useState(null);

  useEffect(() => {
    if (document) {
      loadDocumentContent();
    }
  }, [document]);

  async function loadDocumentContent() {
    setLoading(true);
    setError("");

    try {
      // Get document chunks from the database via API
      const response = await fetch(`http://127.0.0.1:8000/document/${encodeURIComponent(document.name)}`);
      
      if (!response.ok) {
        throw new Error("Failed to load document content");
      }

      const data = await response.json();
      console.log('Document content loaded:', data); // Debug log
      setContent(data.chunks || []);

    } catch (err) {
      console.error("Failed to load document content:", err);
      setError(err.message);
      
      // Fallback: show basic document info
      setContent([{
        id: 1,
        content: `Document: ${document.name}\n\nContent preview not available. You can still take a quiz based on this document's content in the knowledge base.`,
        page_number: 1,
        chunk_index: 0
      }]);
    } finally {
      setLoading(false);
    }
  }

  function getFileIcon(filename) {
    const extension = filename.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📈';
      case 'html':
      case 'htm':
        return '🌐';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
      case 'tiff':
        return '🖼️';
      default:
        return '📄';
    }
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

  if (!document) {
    return (
      <div className="document-viewer">
        <div className="viewer-error">
          <h2>No document selected</h2>
          <button className="back-button" onClick={onBack}>
            ← Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-viewer">
      {/* Header */}
      <div className="viewer-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Library
        </button>
        
        <div className="document-header-info">
          <div className="document-title-section">
            <span className="document-icon-large">{getFileIcon(document.name)}</span>
            <div>
              <h1>{document.name}</h1>
              <p className="document-meta">
                {formatFileSize(document.size)} • 
                {content.length} section{content.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <button 
            className="quiz-me-button primary"
            onClick={() => onQuizMe && onQuizMe(document)}
          >
            🧠 Quiz Me on This Document
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="viewer-content">
        {loading && (
          <div className="loading-section">
            <div className="loading-spinner">📖</div>
            <p>Loading document content...</p>
          </div>
        )}

        {error && (
          <div className="error-section">
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
            <button className="retry-button" onClick={loadDocumentContent}>
              🔄 Retry
            </button>
          </div>
        )}

        {!loading && content.length > 0 && (
          <div className="content-sections">
            <div className="content-header">
              <h2>Document Content</h2>
              <p>Read through the content below, then test your knowledge with a quiz!</p>
            </div>

            {content.map((chunk, index) => (
              <div key={`chunk-${index}`} className="content-chunk">
                <div className="chunk-header">
                  <h3>
                    Section {index + 1}
                    {chunk.page_number && ` (Page ${chunk.page_number})`}
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
                      {chunk.content || 'No content available for this section.'}
                    </p>
                  </div>
                ) : (
                  <div className="chunk-preview">
                    <p>
                      {chunk.content 
                        ? (chunk.content.substring(0, 200) + (chunk.content.length > 200 ? '...' : ''))
                        : 'No preview available - click Expand to view content.'
                      }
                    </p>
                    <small className="preview-hint">Click "Expand" to see full content</small>
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
                    Now that you've reviewed the content, take a quiz to see how much you've learned 
                    from this document!
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
                    ✅ Questions generated from this document
                  </div>
                  <div className="feature-item">
                    ✅ Test your comprehension
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
              <div className="empty-content-icon">📭</div>
              <h3>No content available</h3>
              <p>This document may not have been processed yet, or the content couldn't be extracted.</p>
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

export default DocumentViewer;