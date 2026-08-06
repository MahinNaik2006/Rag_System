import ollama
import numpy as np
import json

from database import db


class ChatBot:

    def __init__(self):
        db.connect()

    def cosine_similarity(self, a, b):

        a = np.array(a)
        b = np.array(b)

        return np.dot(a, b) / (
            np.linalg.norm(a) *
            np.linalg.norm(b)
        )


    def search_documents(self, question):

        response = ollama.embeddings(
            model="nomic-embed-text",
            prompt=question
        )

        query_embedding = response["embedding"]

        docs = db.get_all_documents()

        results = []

        for doc in docs:

            embedding = json.loads(doc["embedding"])

            score = self.cosine_similarity(
                query_embedding,
                embedding
            )

            results.append((score, doc))

        results.sort(
            key=lambda x: x[0],
            reverse=True
        )

        return results[:1]

    # ----------------------------
    # Chat
    # ----------------------------
    def ask(self, question):

        top_chunks = self.search_documents(question)

        context = ""

        sources = []

        for score, doc in top_chunks:

            context += doc["content"] + "\n\n"

            sources.append({
                "topic": doc["topic"],
                "file": doc["file_name"],
                "page": doc["page_number"],
                "score": float(score)
            })

        prompt = f"""
You are an AI Tutor.

Answer ONLY using the context below.

If the answer is not present, reply:

"I couldn't find that in the uploaded documents."

Context:

{context}

Question:

{question}
"""

        response = ollama.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return {
            "answer": response["message"]["content"],
            "sources": sources
        }

    # ----------------------------
    # Quiz Generator
    # ----------------------------
    def generate_quiz(self, num_questions=10, difficulty="medium"):

        docs = db.get_all_documents()

        context = ""

        # Use content from the uploaded PDFs
        for doc in docs[:30]:
            context += doc["content"] + "\n\n"

        prompt = f"""
You are an expert teacher.

Using ONLY the study material below, generate a quiz.

Rules:

- Difficulty: {difficulty}
- Generate exactly {num_questions} questions.
- Multiple Choice Questions.
- Four options.
- Exactly one correct answer.
- Add a short explanation.
- Add a category.
- Return ONLY valid JSON.

Output format:

[
  {{
    "id": 1,
    "question": "Question here",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correct": 0,
    "explanation": "Why this answer is correct.",
    "category": "Topic Name"
  }}
]

Study Material:

{context}
"""

        response = ollama.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        quiz_text = response["message"]["content"]

        # Remove markdown if present
        quiz_text = quiz_text.replace("```json", "")
        quiz_text = quiz_text.replace("```", "").strip()

        try:
            questions = json.loads(quiz_text)

            return {
                "questions": questions
            }

        except Exception as e:

            print("Quiz JSON Error:", e)
            print(quiz_text)

            return {
                "questions": [],
                "error": "Failed to parse quiz JSON."
            }


chatbot = ChatBot()