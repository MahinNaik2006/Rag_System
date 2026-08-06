import { useState, useEffect } from "react";

function HTMLViewer({ document, onBack, onQuizMe }) {
  const [htmlContent, setHtmlContent] = useState("");
  const [textContent, setTextContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("text"); // Default to "text" for safety

  useEffect(() => {
    if (document) {
      loadHTMLContent();
    }
  }, [document]);

  async function loadHTMLContent() {
    setLoading(true);
    setError("");

    try {
      // First try to get processed text content from the database
      const response = await fetch(`http://127.0.0.1:8000/document/${encodeURIComponent(document.name)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.chunks && data.chunks.length > 0) {
          const combinedText = data.chunks.map(chunk => chunk.content).join('\n\n');
          setTextContent(combinedText);
        }
      }

      // Also try to load the raw HTML file for rendering
      try {
        const htmlResponse = await fetch(`http://127.0.0.1:8000/raw-file/${encodeURIComponent(document.name)}`);
        
        if (htmlResponse.ok) {
          const rawHTML = await htmlResponse.text();
          // Basic HTML sanitization - remove scripts and dangerous elements
          const cleanHTML = sanitizeHTML(rawHTML);
          setHtmlContent(cleanHTML);
        }
      } catch (htmlError) {
        console.log("Could not load raw HTML:", htmlError);
        // This is OK - we'll just use text content
      }

    } catch (err) {
      console.error("Failed to load HTML content:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Basic HTML sanitization function
  function sanitizeHTML(html) {
    // Remove script tags and their content
    let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove dangerous event handlers
    cleaned = cleaned.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '');
    cleaned = cleaned.replace(/\s*on\w+\s*=\s*'[^']*'/gi, '');
    
    // Remove javascript: links
    cleaned = cleaned.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
    
    return cleaned;
  }

  if (!document) {
    return (
      <div className="html-viewer">
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
    <div className="html-viewer">
      {/* Header */}
      <div className="viewer-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Library
        </button>
        
        <div className="document-header-info">
          <div className="document-title-section">
            <span className="document-icon-large">🌐</span>
            <div>
              <h1>{document.name}</h1>
              <p className="document-meta">
                HTML Web Page • {(document.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          
          <div className="html-controls">
            <div className="view-mode-switcher">
              <button 
                className={`mode-button ${viewMode === 'rendered' ? 'active' : ''}`}
                onClick={() => setViewMode('rendered')}
              >
                🌐 Rendered View
              </button>
              <button 
                className={`mode-button ${viewMode === 'text' ? 'active' : ''}`}
                onClick={() => setViewMode('text')}
              >
                📝 Text Content
              </button>
            </div>
            
            <button 
              className="quiz-me-button primary"
              onClick={() => onQuizMe && onQuizMe(document)}
            >
              🧠 Quiz Me on This Page
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="html-content">
        {loading && (
          <div className="loading-section">
            <div className="loading-spinner">🌐</div>
            <p>Loading HTML content...</p>
          </div>
        )}

        {error && (
          <div className="error-section">
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
            <button className="retry-button" onClick={loadHTMLContent}>
              🔄 Retry
            </button>
          </div>
        )}

        {!loading && (
          <div className="content-display">
            {viewMode === 'rendered' ? (
              <div className="rendered-content">
                <div className="content-header">
                  <h2>Rendered HTML Content</h2>
                  <p>This is how the HTML page appears when rendered in a browser</p>
                  <div className="html-security-notice">
                    ⚠️ HTML content has been sanitized for security. Some interactive elements may not work.
                  </div>
                </div>
                
                <div className="html-iframe-container">
                  {htmlContent ? (
                    <div className="html-content-frame">
                      <div 
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                      />
                      <div className="sanitization-notice">
                        Content has been processed to remove potentially unsafe elements.
                      </div>
                    </div>
                  ) : (
                    <div className="no-html-content">
                      <p>HTML content could not be loaded for rendering.</p>
                      <button onClick={() => setViewMode('text')}>
                        View Text Content Instead
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              
              <div className="text-content">
                <div className="content-header">
                  <br></br>
                  <h2>Extracted Text Content</h2>
                  <p>This is the text content extracted from the HTML file</p>
                </div>
                
                <div className="text-content-display">
                  {textContent ? (
                    <div className="text-chunks">
                      <pre className="html-text-content">{textContent}</pre>
                    </div>
                  ) : (
                    <div className="no-text-content">
                      <p>No text content available. The HTML file may not have been processed yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quiz CTA */}
            <div className="quiz-cta-section">
              <div className="quiz-cta-card">
                <div className="quiz-cta-content">
                  <h3>🎯 Ready to Test Your Knowledge?</h3>
                  <p>
                    Now that you've reviewed the HTML content, take a quiz to see how much you've learned 
                    from this web page!
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
                    ✅ Questions based on page content
                  </div>
                  <div className="feature-item">
                    ✅ Test your comprehension
                  </div>
                  <div className="feature-item">
                    ✅ Interactive learning
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HTMLViewer;