#!/usr/bin/env python3
"""
Manually insert Steve Jobs quote into database
"""

def manual_insert_steve_jobs():
    """Manually insert the Steve Jobs quote"""
    
    try:
        from database import db
        from embedding import embedding_model
        import json
        
        # The extracted text from OCR
        steve_jobs_text = """Let's go invent tomorrow rather than worrying about what happened yesterday.
— Steve Jobs"""
        
        print("📝 Inserting Steve Jobs quote manually...")
        
        # Generate embedding
        embedding = embedding_model.get_embedding(steve_jobs_text)
        
        if embedding is None:
            print("❌ Failed to generate embedding")
            return False
        
        # Insert into database
        db.insert_document(
            topic="steve_jobs_quotes",
            title="Steve Jobs Quote - Invent Tomorrow",
            file_name="sj.jpg",
            page_number=1,
            chunk_index=0,
            content=steve_jobs_text,
            embedding=json.dumps(embedding)
        )
        
        print("✅ Steve Jobs quote inserted successfully!")
        
        # Test search
        print("\n🔍 Testing search...")
        from search import semantic_search
        
        results = semantic_search.search("steve jobs quote", top_k=3)
        
        if results:
            print(f"Found {len(results)} results:")
            for i, result in enumerate(results):
                print(f"  {i+1}. Score: {result['score']:.3f}")
                print(f"     Content: {result['content'][:100]}...")
        else:
            print("❌ No results found in search")
        
        return True
        
    except Exception as e:
        print(f"❌ Manual insertion failed: {e}")
        return False

if __name__ == "__main__":
    print("=== Manual Steve Jobs Quote Insertion ===\n")
    manual_insert_steve_jobs()
    print("\n=== Complete ===")