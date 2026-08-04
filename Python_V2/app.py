from fastapi import FastAPI, UploadFile, File, HTTPException,Body
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import json
from chat import ChatBot
from ingest import process_pdf

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
# Upload PDF
# ------------------------

UPLOAD_FOLDER = "data_content"

@app.post("/upload")
async def upload(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        inserted = process_pdf(file_path)

        return {
            "success": True,
            "message": "PDF uploaded and indexed successfully.",
            "filename": file.filename,
            "chunks_inserted": inserted
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