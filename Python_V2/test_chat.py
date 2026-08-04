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

        print("Generating query embedding...")

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

            results.append(
                (
                    score,
                    doc
                )
            )


        results.sort(
            key=lambda x: x[0],
            reverse=True
        )


        return results[:5]



    def ask(self, question):

        print("\nQUESTION:", question)


        top_chunks = self.search_documents(question)


        print("TOP CHUNKS:", len(top_chunks))


        context = ""

        sources = []


        for score, doc in top_chunks:

            print("Found:", doc["file_name"])


            context += doc["content"] + "\n\n"


            sources.append(
                {
                    "topic": doc["topic"],
                    "file": doc["file_name"],
                    "page": doc["page_number"],
                    "score": float(score)
                }
            )


        prompt = f"""
You are an AI Tutor.

Answer ONLY using the context below.

If the answer is not present in the context, reply:

"I couldn't find that in the uploaded documents."

Context:

{context}


Question:

{question}

"""


        print("Sending to Ollama...")


        response = ollama.chat(

            model="llama3.2",

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]

        )


        print("Ollama completed.")


        return {

            "answer": response["message"]["content"],

            "sources": sources

        }




# ==========================
# USER INPUT STARTS HERE
# ==========================

if __name__ == "__main__":


    chatbot = ChatBot()


    while True:


        question = input(
            "\nAsk your question (type exit to stop): "
        )


        if question.lower() == "exit":

            print("Chatbot stopped.")

            break



        result = chatbot.ask(question)



        print("\n======================")

        print("ANSWER:")

        print(result["answer"])



        print("\nSOURCES:")

        for source in result["sources"]:

            print(source)


        print("======================")