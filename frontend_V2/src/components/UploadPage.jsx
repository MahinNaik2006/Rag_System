import { useState, useEffect } from "react";

function UploadPage({ onUpload, uploadedFileName }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Get file type icon
  function getFileIcon(filename) {
    const extension = filename.toLowerCase().split('.').pop();
    if (extension === 'pdf') return '📄';
    if (['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'gif'].includes(extension)) return '🖼️';
    if (['html', 'htm'].includes(extension)) return '🌐';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(extension)) return '🎬';
    return '📎';
  }

  // Load all uploaded files
  async function loadFiles() {
    try {
      const response = await fetch("http://127.0.0.1:8000/files");
      const data = await response.json();

      setUploadedFiles(data.files || []);
    } catch (error) {
      console.error(error);
      setStatusMessage(`❌ ${error.message}`);
    }
  }

  // Load files when page opens
  useEffect(() => {
    loadFiles();
  }, []);

  // Upload file
  async function handleUpload() {
    if (!selectedFile) {
      setStatusMessage("Please choose a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed.");
      }

      onUpload?.(data.filename);

      setStatusMessage(
        `✅ ${data.filename} uploaded successfully (${data.chunks_inserted} chunks indexed).`
      );

      // Refresh file list
      loadFiles();

      // Clear selected file
      setSelectedFile(null);

      // Reset input value
      document.getElementById("document-upload").value = "";
    } catch (error) {
      console.error(error);
      setStatusMessage(`❌ ${error.message}`);
    }
  }

  return (
    <section className="upload-page">
      <div className="upload-hero">
        <div>
          <p className="upload-eyebrow">Knowledge Base</p>
          <h2>Upload a document, image, or video</h2>
          <p>
            Add PDF files, images, HTML files, or videos so the assistant can answer questions using your
            documents, image content (via OCR), and video transcripts.
          </p>
        </div>
      </div>

      <div className="upload-card">
        <div className="upload-card-header">
          <div>
            <h3>Drop in your file</h3>
            <p>Upload PDF documents, images (PNG, JPG, JPEG, BMP, TIFF, GIF), HTML files, or videos (MP4, AVI, MOV, WMV, FLV, WEBM, MKV, M4V) to build your knowledge base.</p>
          </div>

          {uploadedFileName && (
            <span className="upload-badge">{uploadedFileName}</span>
          )}
        </div>

        <label className="upload-dropzone" htmlFor="document-upload">
          <span className="upload-dropzone-icon">⬆️</span>
          <span className="upload-dropzone-text">
            {selectedFile
              ? selectedFile.name
              : "Click here to choose a PDF, Image, HTML, or Video file"}
          </span>

          <input
            id="document-upload"
            className="upload-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.bmp,.tiff,.gif,.html,.htm,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv,.m4v"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;

              setSelectedFile(file);

              if (file) {
                setStatusMessage(`Selected: ${file.name}`);
              } else {
                setStatusMessage("");
              }
            }}
          />
        </label>

        <div className="upload-actions">
          <button
            className="upload-button"
            type="button"
            onClick={handleUpload}
          >
            Upload File
          </button>

          {uploadedFileName && (
            <span className="upload-status">
              Current document: {uploadedFileName}
            </span>
          )}
        </div>

        {statusMessage && (
          <p
            className={`upload-status ${
              statusMessage.startsWith("✅") ? "success" : ""
            }`}
          >
            {statusMessage}
          </p>
        )}
      </div>

      {/* Uploaded Files */}
      <div className="uploaded-files-card">
        <h3>📂 Uploaded Files</h3>

        {uploadedFiles.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          <ul className="uploaded-files-list">
            {uploadedFiles.map((file) => (
              <li key={file.name} className="uploaded-file-item">
                <div>
                  <strong>{getFileIcon(file.name)} {file.name}</strong>
                </div>

                <span>
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default UploadPage;