import json
import time
import numpy as np

from database import db
from embedding import embedding_model


class SemanticSearch:

    def __init__(self):
        pass

    # ----------------------------------
    # Cosine Similarity
    # ----------------------------------

    @staticmethod
    def cosine_similarity(vec1, vec2):

        vec1 = np.array(vec1, dtype=np.float32)
        vec2 = np.array(vec2, dtype=np.float32)

        denominator = np.linalg.norm(vec1) * np.linalg.norm(vec2)

        if denominator == 0:
            return 0.0

        return float(np.dot(vec1, vec2) / denominator)

    # ----------------------------------
    # Search
    # ----------------------------------

    def search(self, query, top_k=5):

        start_time = time.time()

        print(f"\nSearching for: {query}")

        query_embedding = embedding_model.get_embedding(query)

        if query_embedding is None:

            print("Failed to generate query embedding.")

            return []

        rows = db.get_all_documents()

        results = []

        for row in rows:

            try:

                embedding = json.loads(row["embedding"])

                score = self.cosine_similarity(
                    query_embedding,
                    embedding
                )

                row["score"] = score

                results.append(row)

            except Exception as e:

                print(
                    f"Skipping row {row.get('id')} : {e}"
                )

        results.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        elapsed = time.time() - start_time

        print(
            f"Search completed in {elapsed:.2f} seconds."
        )

        return results[:top_k]

    # ----------------------------------
    # Pretty Print
    # ----------------------------------

    def print_results(self, results):

        print()

        for i, row in enumerate(results, start=1):

            print("=" * 70)

            print(f"Result {i}")

            print(f"Score : {row['score']:.4f}")

            print(f"Topic : {row['topic']}")

            print(f"File  : {row['file_name']}")

            print(f"Page  : {row['page_number']}")

            print()

            preview = row["content"][:400]

            print(preview)

            print()

        print("=" * 70)


semantic_search = SemanticSearch()


if __name__ == "__main__":

    while True:

        question = input("\nAsk: ")

        if question.lower() in ["exit", "quit"]:

            break

        docs = semantic_search.search(question)

        semantic_search.print_results(docs)