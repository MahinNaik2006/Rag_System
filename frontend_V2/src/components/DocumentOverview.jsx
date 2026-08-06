import { useState, useEffect } from "react";

function DocumentOverview({ onDocumentSelect }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load documents when component mounts
  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://127.0.0.1:8000/files");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Failed to load documents");
      }
      
      // Include all uploaded files (PDFs, images, HTML, and videos)
      const allFiles = data.files || [];
      
      setDocuments(allFiles);
      
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError(err.message);
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
      case 'webp':
      case 'svg':
        return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
      case 'flv':
      case 'webm':
      case 'mkv':
      case 'm4v':
        return '🎬';
      default:
        return '📄';
    }
  }

  function getFileType(filename) {
    const extension = filename.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'txt':
        return 'Text File';
      case 'xls':
      case 'xlsx':
        return 'Excel Spreadsheet';
      case 'ppt':
      case 'pptx':
        return 'PowerPoint Presentation';
      case 'html':
      case 'htm':
        return 'HTML Web Page';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
      case 'tiff':
      case 'webp':
      case 'svg':
        return 'Image File';
      case 'mp4':
        return 'MP4 Video';
      case 'avi':
        return 'AVI Video';
      case 'mov':
        return 'QuickTime Video';
      case 'wmv':
        return 'Windows Media Video';
      case 'flv':
        return 'Flash Video';
      case 'webm':
        return 'WebM Video';
      case 'mkv':
        return 'Matroska Video';
      case 'm4v':
        return 'MPEG-4 Video';
      default:
        return 'Document';
    }
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function isVideoFile(filename) {
    const extension = filename.toLowerCase().split('.').pop();
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'];
    return videoExtensions.includes(extension);
  }

  if (loading) {
    return (
      <div className="document-overview">
        <div className="overview-header">
          <h2>Document Library</h2>
          <p>Loading documents...</p>
        </div>
        <div className="loading-spinner-container">
          <div className="loading-spinner">📚</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-overview">
        <div className="overview-header">
          <h2>Document Library</h2>
          <p className="error-message">❌ {error}</p>
        </div>
        <div className="retry-section">
          <button className="retry-button" onClick={loadDocuments}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="document-overview">
        <div className="overview-header">
          <h2>Document Library</h2>
          <p>Your uploaded documents will appear here</p>
        </div>
        <div className="empty-library">
          <div className="empty-library-content">
            <div className="empty-icon">📚</div>
            <h3>No Documents Found</h3>
            <p>Upload some documents to get started with document-specific quizzes and content review.</p>
            <button 
              className="upload-prompt-button"
              onClick={() => onDocumentSelect && onDocumentSelect('upload')}
            >
              📤 Upload Documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="document-overview">
      <div className="overview-header">
        <h2>Document Library</h2>
        <p>View and quiz yourself on your uploaded documents, images, and videos</p>
        <div className="overview-stats">
          <span className="stat-item">
            📁 {documents.length} File{documents.length !== 1 ? 's' : ''}
          </span>
          <button className="refresh-button" onClick={loadDocuments} title="Refresh list">
            🔄
          </button>
        </div>
      </div>

      <div className="documents-grid">
        {documents.map((doc, index) => (
          <div key={`${doc.name}-${index}`} className="document-card">
            <div className="document-icon">
              {getFileIcon(doc.name)}
            </div>
            
            <div className="document-info">
              <h3 className="document-title">{doc.name}</h3>
              <p className="document-type">{getFileType(doc.name)}</p>
              <p className="document-size">{formatFileSize(doc.size)}</p>
            </div>

            <div className="document-actions">
              <button 
                className="action-button view-button"
                onClick={() => onDocumentSelect && onDocumentSelect('view', doc)}
                title={isVideoFile(doc.name) ? "Watch video" : "View document content"}
              >
                {isVideoFile(doc.name) ? '🎬 Watch Video' : '👁️ View Content'}
              </button>
              
              <button 
                className="action-button quiz-button"
                onClick={() => onDocumentSelect && onDocumentSelect('quiz', doc)}
                title="Take quiz on this document"
              >
                🧠 Quiz Me
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="overview-footer">
        <div className="footer-info">
          <p>💡 <strong>Tip:</strong> Click "View Content" to read documents or "Watch Video" to play videos, then "Quiz Me" to test your knowledge!</p>
        </div>
      </div>
    </div>
  );
}

export default DocumentOverview;