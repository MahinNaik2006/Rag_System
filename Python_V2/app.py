from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse
import shutil
import os
import json
from chat import ChatBot
from ingest import process_pdf, process_image, process_html, process_video

chatbot = ChatBot()

app = FastAPI()

# ------------------------
# CORS
# ------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# Home
# ------------------------

@app.get("/")
def home():
    return {
        "status": "THIS IS MY SERVER"
    }

# ------------------------
# Chat
# ------------------------

@app.post("/chat")
async def chat(data: dict):

    question = data.get("question")

    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    result = chatbot.ask(question)

    return result


# ------------------------
# Upload PDF and Images
# ------------------------

UPLOAD_FOLDER = "data_content"

@app.post("/upload")
async def upload(file: UploadFile = File(...)):

    file_lower = file.filename.lower()
    
    # Check if file is PDF, supported image format, HTML, or video
    is_pdf = file_lower.endswith(".pdf")
    is_image = file_lower.endswith((".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".gif"))
    is_html = file_lower.endswith((".html", ".htm"))
    is_video = file_lower.endswith((".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv", ".m4v"))
    
    if not (is_pdf or is_image or is_html or is_video):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files, images (PNG, JPG, JPEG, BMP, TIFF, GIF), HTML files, and videos (MP4, AVI, MOV, WMV, FLV, WEBM, MKV, M4V) are allowed."
        )

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        if is_pdf:
            inserted = process_pdf(file_path)
            message = "PDF uploaded and indexed successfully."
        elif is_image:
            inserted = process_image(file_path)
            message = "Image uploaded and OCR text extracted successfully."
        elif is_html:
            inserted = process_html(file_path)
            message = "HTML file uploaded and content extracted successfully."
        elif is_video:
            inserted = process_video(file_path)
            message = "Video uploaded and transcription extracted successfully."

        return {
            "success": True,
            "message": message,
            "filename": file.filename,
            "chunks_inserted": inserted,
            "file_type": "video" if is_video else "pdf" if is_pdf else "image" if is_image else "html"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/files")
async def get_uploaded_files():

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    files = []

    for filename in os.listdir(UPLOAD_FOLDER):
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        if os.path.isfile(filepath):
            files.append({
                "name": filename,
                "size": os.path.getsize(filepath)
            })

    files.sort(key=lambda x: x["name"].lower())

    return {
        "files": files
    }

@app.get("/document/{filename}")
async def get_document_content(filename: str):
    """Get the content chunks for a specific document"""
    
    try:
        from database import db
        
        # Get all chunks for this document from database
        chunks = db.get_documents_by_file(filename)
        
        if not chunks:
            raise HTTPException(
                status_code=404,
                detail=f"No content found for document: {filename}"
            )
        
        # Format the chunks for frontend display
        formatted_chunks = []
        for chunk in chunks:
            formatted_chunks.append({
                "id": chunk.get("id"),
                "content": chunk.get("content", ""),
                "page_number": chunk.get("page_number", 1),
                "chunk_index": chunk.get("chunk_index", 0),
                "title": chunk.get("title", f"{filename} - Section {chunk.get('chunk_index', 0) + 1}")
            })
        
        # Sort by page number and chunk index
        formatted_chunks.sort(key=lambda x: (x["page_number"], x["chunk_index"]))
        
        return {
            "filename": filename,
            "total_chunks": len(formatted_chunks),
            "chunks": formatted_chunks
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve document content: {str(e)}"
        )

@app.get("/raw-file/{filename}")
async def get_raw_file(filename: str):
    """Get the raw file content for HTML files and serve videos"""
    
    try:
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=404,
                detail=f"File not found: {filename}"
            )
        
        # Allow certain file types for security
        allowed_extensions = ['.html', '.htm', '.txt', '.css', '.js', 
                            '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v']
        file_extension = os.path.splitext(filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=403,
                detail=f"File type not allowed for raw access: {file_extension}"
            )
        
        # For video files, return file response for streaming
        if file_extension in ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v']:
            from fastapi.responses import FileResponse
            
            # Set appropriate content type for videos
            content_type_map = {
                '.mp4': "video/mp4",
                '.avi': "video/x-msvideo", 
                '.mov': "video/quicktime",
                '.wmv': "video/x-ms-wmv",
                '.flv': "video/x-flv",
                '.webm': "video/webm",
                '.mkv': "video/x-matroska",
                '.m4v': "video/mp4"
            }
            
            return FileResponse(
                path=file_path,
                media_type=content_type_map.get(file_extension, "video/mp4"),
                headers={"Accept-Ranges": "bytes"}
            )
        
        # For text-based files, read and return content
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
            content = file.read()
        
        # Set appropriate content type for text files
        if file_extension in ['.html', '.htm']:
            content_type = "text/html"
        elif file_extension == '.css':
            content_type = "text/css"
        elif file_extension == '.js':
            content_type = "application/javascript"
        else:
            content_type = "text/plain"
        
        return Response(content=content, media_type=content_type)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read file: {str(e)}"
        )


# ------------------------
# Video Streaming
# ------------------------

@app.get("/video/{filename}")
async def stream_video(filename: str, request: Request):
    """Stream video files with range support for proper video playback"""
    
    try:
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Video file not found")
        
        # Check if it's a video file
        video_extensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v']
        file_extension = os.path.splitext(filename)[1].lower()
        
        if file_extension not in video_extensions:
            raise HTTPException(status_code=400, detail="File is not a video")
        
        file_size = os.path.getsize(file_path)
        
        # Get range header for video streaming
        range_header = request.headers.get('range')
        
        # Set content type based on file extension
        content_type_map = {
            '.mp4': "video/mp4",
            '.avi': "video/x-msvideo", 
            '.mov': "video/quicktime",
            '.wmv': "video/x-ms-wmv",
            '.flv': "video/x-flv",
            '.webm': "video/webm",
            '.mkv': "video/x-matroska",
            '.m4v': "video/mp4"
        }
        content_type = content_type_map.get(file_extension, "video/mp4")
        
        # Handle range requests for video streaming
        if range_header:
            # Parse range header (e.g., "bytes=0-1023")
            range_match = range_header.replace('bytes=', '').split('-')
            start = int(range_match[0]) if range_match[0] else 0
            end = int(range_match[1]) if range_match[1] else file_size - 1
            end = min(end, file_size - 1)
            
            # Read the requested chunk
            with open(file_path, 'rb') as video_file:
                video_file.seek(start)
                data = video_file.read(end - start + 1)
            
            # Return partial content response
            headers = {
                'Content-Range': f'bytes {start}-{end}/{file_size}',
                'Accept-Ranges': 'bytes',
                'Content-Length': str(len(data)),
                'Content-Type': content_type
            }
            
            return Response(content=data, status_code=206, headers=headers)
        
        else:
            # Return full file if no range specified
            return FileResponse(
                path=file_path,
                media_type=content_type,
                headers={
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(file_size)
                }
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error streaming video: {str(e)}")


@app.get("/video-info/{filename}")
async def get_video_info(filename: str):
    """Get video metadata information"""
    
    try:
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Video file not found")
        
        # Check if it's a video file
        video_extensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v']
        file_extension = os.path.splitext(filename)[1].lower()
        
        if file_extension not in video_extensions:
            raise HTTPException(status_code=400, detail="File is not a video")
        
        # Try to get video metadata using moviepy
        try:
            from moviepy.editor import VideoFileClip
            with VideoFileClip(file_path) as video:
                return {
                    "filename": filename,
                    "duration": video.duration,
                    "fps": video.fps,
                    "width": video.w,
                    "height": video.h,
                    "size": os.path.getsize(file_path)
                }
        except Exception:
            # Fallback to basic file info if moviepy fails
            return {
                "filename": filename,
                "duration": 0,
                "fps": 0,
                "width": 0,
                "height": 0,
                "size": os.path.getsize(file_path)
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting video info: {str(e)}")


# ------------------------
# Roadmap
# ------------------------

@app.post("/roadmap")
async def roadmap(data: dict):

    topic = data.get("topic")

    return {
        "roadmap": [
            "Introduction",
            "Basics",
            "Intermediate",
            "Advanced",
            "Projects"
        ]
    }



@app.post("/quiz")
async def generate_quiz(data: dict = Body(...)):

    num_questions = data.get("num_questions", 10)
    difficulty = data.get("difficulty", "medium")

    prompt = f"""
You are an expert teacher.

Using ONLY the uploaded study material stored in the vector database,
generate {num_questions} multiple choice questions.

Rules:

- Difficulty: {difficulty}
- Four options
- One correct answer
- Explanation for every answer
- Return ONLY valid JSON.

Format:

[
 {{
    "id":1,
    "question":"...",
    "options":["A","B","C","D"],
    "correct":0,
    "explanation":"...",
    "category":"..."
 }}
]
"""

    result = chatbot.ask(prompt)

    try:
        questions = json.loads(result["answer"])
        return {"questions": questions}

    except:
        return {"questions": []}

@app.post("/document-quiz")
async def generate_document_quiz(data: dict = Body(...)):
    """Generate quiz questions for a specific document"""

    num_questions = data.get("num_questions", 5)
    difficulty = data.get("difficulty", "medium")
    document_name = data.get("document_name", "document")
    document_content = data.get("document_content", "")

    # Truncate content if too long for the prompt
    max_content_length = 3000
    if len(document_content) > max_content_length:
        document_content = document_content[:max_content_length] + "..."

    prompt = f"""
You are an expert teacher creating a quiz based on a specific document.

Document: {document_name}

Content to base questions on:
{document_content}

Create {num_questions} multiple choice questions based ONLY on the content above.

Rules:
- Difficulty: {difficulty}
- Four options per question
- One correct answer per question
- Questions should test comprehension of the document content
- Include detailed explanations
- Return ONLY valid JSON

Format:
[
 {{
    "id": 1,
    "question": "Based on the document, what is...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "According to the document content...",
    "category": "{document_name}"
 }}
]
"""

    try:
        result = chatbot.ask(prompt)
        questions = json.loads(result["answer"])
        
        # Ensure each question has the document name as category
        for question in questions:
            question["category"] = document_name
            
        return {"questions": questions}

    except Exception as e:
        # Fallback questions if generation fails
        fallback_questions = [
            {
                "id": 1,
                "question": f"What is the main topic discussed in {document_name}?",
                "options": [
                    "Technical information",
                    "Business processes", 
                    "Educational content",
                    "General documentation"
                ],
                "correct": 0,
                "explanation": f"Based on the content in {document_name}, review the document to identify the main themes and topics covered.",
                "category": document_name
            }
        ]
        return {"questions": fallback_questions}