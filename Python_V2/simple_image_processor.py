#!/usr/bin/env python3
"""
Simple image processor that works with basic dependencies
"""

import os
import json
from PIL import Image
import pytesseract

# Configure Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def chunk_text(text, chunk_size=500, overlap=100):
    """Split text into chunks"""
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        
        if chunk:
            chunks.append(chunk)
        
        start += chunk_size - overlap
    
    return chunks

def process_steve_jobs_image():
    """Process the Steve Jobs image and show what would be stored"""
    
    image_path = "data_content/sj.jpg"
    image_name = os.path.basename(image_path)
    topic = os.path.splitext(image_name)[0]
    
    print(f"\n📊 Processing: {image_name}")
    print(f"Topic: {topic}")
    
    try:
        # Load image and extract text
        img = Image.open(image_path)
        extracted_text = pytesseract.image_to_string(img)
        
        print(f"\n📝 Extracted text:")
        print("-" * 40)
        print(extracted_text)
        print("-" * 40)
        
        if not extracted_text.strip():
            print("❌ No text extracted")
            return
        
        # Split into chunks
        chunks = chunk_text(extracted_text)
        
        print(f"\n📦 Text split into {len(chunks)} chunks:")
        
        for i, chunk in enumerate(chunks):
            print(f"\nChunk {i+1}:")
            print(f"  Length: {len(chunk)} characters")
            print(f"  Content: {chunk[:100]}{'...' if len(chunk) > 100 else ''}")
            
            # This is what would be stored in the database
            document_data = {
                "topic": topic,
                "title": f"{image_name} (OCR Text)",
                "file_name": image_name,
                "page_number": 1,
                "chunk_index": i,
                "content": chunk
            }
            
            print(f"  Database record: {document_data}")
        
        print(f"\n✅ Would insert {len(chunks)} chunks into database")
        
        # Show what search terms would work
        text_lower = extracted_text.lower()
        search_terms = [
            "steve jobs",
            "invent tomorrow", 
            "worrying about yesterday",
            "steve jobs quote",
            "innovation",
            "tomorrow"
        ]
        
        print(f"\n🔍 Search terms that should work:")
        for term in search_terms:
            if any(word in text_lower for word in term.split()):
                print(f"  ✅ '{term}' - should find this content")
            else:
                print(f"  ❌ '{term}' - might not match")
        
    except Exception as e:
        print(f"❌ Processing failed: {e}")

if __name__ == "__main__":
    print("=== Simple Steve Jobs Image Processor ===")
    process_steve_jobs_image()
    print("\n=== Processing Complete ===")