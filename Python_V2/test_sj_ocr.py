#!/usr/bin/env python3
"""
Test OCR on Steve Jobs image
"""

import os
from PIL import Image
import pytesseract

# Configure Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def test_steve_jobs_image():
    """Test OCR on the Steve Jobs image"""
    
    image_path = "data_content/sj.jpg"
    
    print(f"🖼️ Testing OCR on: {image_path}")
    
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return False
    
    try:
        # Load image
        img = Image.open(image_path)
        print(f"✅ Image loaded: {img.size}, mode: {img.mode}")
        
        # Extract text using OCR
        print("\n🔍 Extracting text with OCR...")
        extracted_text = pytesseract.image_to_string(img)
        
        print(f"\n📝 Extracted text ({len(extracted_text)} characters):")
        print("=" * 60)
        print(extracted_text)
        print("=" * 60)
        
        if extracted_text.strip():
            print("✅ OCR extraction successful!")
            
            # Check for Steve Jobs related content
            text_lower = extracted_text.lower()
            keywords = ['steve', 'jobs', 'apple', 'innovation', 'think', 'different', 'quote']
            found_keywords = [kw for kw in keywords if kw in text_lower]
            
            if found_keywords:
                print(f"🎯 Found Steve Jobs related keywords: {found_keywords}")
            else:
                print("⚠️ No Steve Jobs related keywords found in extracted text")
            
            return True
        else:
            print("❌ No text extracted from image")
            return False
            
    except Exception as e:
        print(f"❌ OCR failed: {e}")
        return False

def test_process_image():
    """Test the process_image function"""
    
    print(f"\n{'='*60}")
    print("🧪 Testing process_image function...")
    
    try:
        from ingest import process_image
        
        image_path = "data_content/sj.jpg"
        print(f"Processing: {image_path}")
        
        chunks_inserted = process_image(image_path)
        
        print(f"✅ process_image completed: {chunks_inserted} chunks inserted")
        
        if chunks_inserted > 0:
            print("🎉 Image processing successful - text was extracted and stored!")
        else:
            print("⚠️ No chunks inserted - check if image already exists or OCR failed")
        
        return chunks_inserted > 0
        
    except Exception as e:
        print(f"❌ process_image failed: {e}")
        return False

if __name__ == "__main__":
    print("=== Steve Jobs Image OCR Test ===\n")
    
    # Test direct OCR
    ocr_success = test_steve_jobs_image()
    
    # Test processing function
    if ocr_success:
        test_process_image()
    
    print("\n=== Test Complete ===")