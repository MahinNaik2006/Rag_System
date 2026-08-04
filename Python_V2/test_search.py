from search import semantic_search


def main():

    print("=" * 60)
    print("Semantic Search Test")
    print("=" * 60)

    while True:

        query = input("\nSearch: ").strip()

        if query.lower() in ["exit", "quit"]:
            print("\nGoodbye!")
            break

        if not query:
            continue

        results = semantic_search.search(
            query=query,
            top_k=5
        )

        semantic_search.print_results(results)


if __name__ == "__main__":
    main()