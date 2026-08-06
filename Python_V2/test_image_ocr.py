#!/usr/bin/env python3
"""
Test script for image OCR functionality
"""

import os
from PIL import Image, ImageDraw, ImageFont
import pytesseract
from ingest import process_image
from search import semantic_search
from chat import ChatBot

def create_test_image():
    """Create a test image with some text"""
    # Create image
    img = Image.new('RGB', (400, 200), color='white')
    d = ImageDraw.Draw(img)
    
    # Add some test text
    try:
        font = ImageFont.load_default()
    except:
        font = None
    
    text_content = """
    Python Programming Guide
    
    Variables: Store data values
    Functions: Reusable code blocks  
    Classes: Object templates
    Modules: Code organization
    """
    
    d.text((20, 20), text_content.strip(), fill='black', font=font)
    
    # Save image
    test_image_path = "test_python_guide.png"
    img.save(test_image_path)
    
    return test_image_path

def test_image_processing():
    """Test the complete image OCR workflow"""
    
    print("=== Testing Image OCR Functionality ===\n")
    
    # Create test image
    print("1. Creating test image...")
    image_path = create_test_image()
    print(f"   Created: {image_path}")
    
    # Test OCR extraction
    print("\n2. Testing OCR text extraction...")
    try:
        img = Image.open(image_path)
        extracted_text = pytesseract.image_to_string(img)
        print(f"   Extracted text: '{extracted_text.strip()}'")
    except Exception as e:
        print(f"   ❌ OCR failed: {e}")
        return False
    
    # Test processing with ingest function
    print("\n3. Testing image processing pipeline...")
    try:
        chunks_inserted = process_image(image_path)
        print(f"   ✅ Inserted {chunks_inserted} chunks into database")
    except Exception as e:
        print(f"   ❌ Processing failed: {e}")
        return False
    
    # Test search functionality
    print("\n4. Testing search with OCR content...")
    try:
        results = semantic_search.search("Python programming", top_k=3)
        print(f"   Found {len(results)} search results")
        
        for i, result in enumerate(results[:2]):
            print(f"   Result {i+1}: Score {result['score']:.3f} - {result['file_name']}")
            
    except Exception as e:
        print(f"   ❌ Search failed: {e}")
    
    # Test chat functionality  
    print("\n5. Testing chat with image content...")
    try:
        chatbot = ChatBot()
        response = chatbot.ask("What are the Python programming concepts mentioned in the uploaded content?")
        print(f"   Chat response: {response['answer'][:200]}...")
    except Exception as e:
        print(f"   ❌ Chat failed: {e}")
    
    # Clean up
    if os.path.exists(image_path):
        os.remove(image_path)
        print(f"\n   Cleaned up: {image_path}")
    
    print("\n🎉 Image OCR test completed!")
    return True

if __name__ == "__main__":
    test_image_processing()