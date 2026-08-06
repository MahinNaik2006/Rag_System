# Image OCR Integration

This RAG system now supports image uploads with OCR (Optical Character Recognition) text extraction.

## Features

- Upload image files (PNG, JPG, JPEG, BMP, TIFF, GIF)
- Automatic text extraction using OCR
- Search through OCR-extracted text
- Chat with content from both PDFs and images

## Requirements

### Python Dependencies
```bash
pip install -r requirements.txt
```

### Tesseract OCR Engine
The system requires Tesseract OCR to be installed on your system:

**Windows:**
- Download from: https://github.com/UB-Mannheim/tesseract/wiki
- Add to PATH

**macOS:**
```bash
brew install tesseract
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install tesseract-ocr
```

## Installation & Testing

1. **Install dependencies:**
   ```bash
   cd Python_V2
   python install_ocr.py
   ```

2. **Test OCR functionality:**
   ```bash
   python test_image_ocr.py
   ```

## Usage

### Backend
The system automatically processes uploaded images:
- Extracts text using OCR
- Chunks the text for embedding
- Stores in the same database as PDF content
- Enables search across all content

### Frontend
- Upload images through the same interface as PDFs
- File type detection shows appropriate icons
- Status messages indicate OCR processing

### API Endpoints

**Upload (now supports images):**
```
POST /upload
Content-Type: multipart/form-data

Accepts: .pdf, .png, .jpg, .jpeg, .bmp, .tiff, .gif
```

**Chat (works with OCR content):**
```
POST /chat
{
  "question": "What text appears in the uploaded image?"
}
```

## How It Works

1. **Image Upload:** User uploads an image file
2. **OCR Processing:** Tesseract extracts text from the image
3. **Text Chunking:** Extracted text is split into searchable chunks
4. **Embedding Generation:** Each chunk gets an embedding vector
5. **Storage:** Chunks stored in database with metadata
6. **Search & Chat:** Content available for semantic search and Q&A

## Troubleshooting

**"Tesseract not found" error:**
- Ensure Tesseract is installed and in your PATH
- On Windows, you may need to set the tesseract path:
  ```python
  pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
  ```

**Poor OCR quality:**
- Use high-resolution images
- Ensure good contrast between text and background
- Avoid skewed or rotated text when possible

**No text extracted:**
- Check if image actually contains readable text
- Try preprocessing the image (contrast, brightness)
- Verify image format is supported