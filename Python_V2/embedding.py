from ollama import Client


class EmbeddingModel:

    def __init__(self):

        self.host = "http://localhost:11434"
        self.model = "nomic-embed-text"

        self.client = Client(host=self.host)

    # ----------------------------------
    # Get embedding for a single text
    # ----------------------------------

    def get_embedding(self, text: str):

        try:

            response = self.client.embed(
                model=self.model,
                input=text
            )

            return response["embeddings"][0]

        except Exception as e:

            print("Embedding Error:", e)

            return None

    # ----------------------------------
    # Get embeddings for multiple texts
    # ----------------------------------

    def get_embeddings(self, texts):

        try:

            response = self.client.embed(
                model=self.model,
                input=texts
            )

            return response["embeddings"]

        except Exception as e:

            print("Embedding Error:", e)

            return []

    # ----------------------------------
    # Test Ollama Connection
    # ----------------------------------

    def test_connection(self):

        try:

            embedding = self.get_embedding("Hello")

            if embedding:

                print("✅ Ollama Embedding Model Connected")
                print(f"Embedding Size: {len(embedding)}")
                return True

            return False

        except Exception as e:

            print(e)
            return False


embedding_model = EmbeddingModel()