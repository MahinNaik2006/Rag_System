from embedding import embedding_model


def main():

    print("=" * 50)
    print("Testing Embedding Model")
    print("=" * 50)

    text = """
Java is an object-oriented programming language.
"""

    embedding = embedding_model.get_embedding(text)

    if embedding is None:
        print("❌ Failed to generate embedding.")
        return

    print("✅ Embedding generated successfully!\n")

    print(f"Type      : {type(embedding)}")
    print(f"Dimensions: {len(embedding)}")

    print("\nFirst 10 values:")
    print(embedding[:10])

    print("\nMin Value :", min(embedding))
    print("Max Value :", max(embedding))

    print("\n✅ Test Passed")


if __name__ == "__main__":
    main()