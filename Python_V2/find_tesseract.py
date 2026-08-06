#!/usr/bin/env python3
"""
Script to find and configure Tesseract OCR installation
"""

import os
import subprocess
import sys

def find_tesseract():
    """Find Tesseract installation on Windows"""
    
    print("🔍 Searching for Tesseract installation...")
    
    # Common installation paths
    common_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        r'C:\Users\{}\AppData\Local\Tesseract-OCR\tesseract.exe'.format(os.getenv('USERNAME', '')),
        r'C:\tesseract\tesseract.exe',
        r'C:\tools\tesseract\tesseract.exe'
    ]
    
    found_paths = []
    
    for path in common_paths:
        if os.path.exists(path):
            found_paths.append(path)
            print(f"✅ Found: {path}")
    
    if not found_paths:
        print("❌ Tesseract not found at common locations")
        
        # Try to find via Windows search
        print("\n🔍 Searching entire system (this may take a moment)...")
        try:
            # Use where command to find tesseract
            result = subprocess.run(['where', 'tesseract'], 
                                  capture_output=True, text=True, shell=True)
            if result.returncode == 0:
                paths = result.stdout.strip().split('\n')
                for path in paths:
                    if path.strip() and os.path.exists(path.strip()):
                        found_paths.append(path.strip())
                        print(f"✅ Found via PATH: {path.strip()}")
        except Exception as e:
            print(f"Search failed: {e}")
    
    return found_paths

def test_tesseract(tesseract_path):
    """Test if Tesseract works at given path"""
    
    print(f"\n🧪 Testing Tesseract at: {tesseract_path}")
    
    try:
        # Set the path
        import pytesseract
        pytesseract.pytesseract.tesseract_cmd = tesseract_path
        
        # Test with a simple command
        from PIL import Image
        import numpy as np
        
        # Create a simple test image with text
        test_img = Image.new('RGB', (200, 50), color='white')
        from PIL import ImageDraw, ImageFont
        d = ImageDraw.Draw(test_img)
        d.text((10, 10), "Hello World", fill='black')
        
        # Test OCR
        text = pytesseract.image_to_string(test_img)
        print(f"✅ OCR Test Result: '{text.strip()}'")
        
        if 'hello' in text.lower() or 'world' in text.lower():
            print("🎉 Tesseract is working correctly!")
            return True
        else:
            print("⚠️ OCR returned unexpected result")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def update_ingest_file(working_path):
    """Update the ingest.py file with the correct Tesseract path"""
    
    print(f"\n📝 Updating ingest.py with path: {working_path}")
    
    # Read current ingest.py
    ingest_path = "ingest.py"
    if not os.path.exists(ingest_path):
        print("❌ ingest.py not found")
        return False
    
    try:
        # Create a backup
        import shutil
        shutil.copy(ingest_path, f"{ingest_path}.backup")
        
        # Update the file
        with open(ingest_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add the path configuration after imports
        tesseract_config = f"""
# Configure Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'{working_path}'
"""
        
        # Insert after the pytesseract import
        if 'import pytesseract' in content:
            content = content.replace('import pytesseract', 
                                    f'import pytesseract{tesseract_config}')
            
            with open(ingest_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print("✅ Updated ingest.py successfully")
            return True
        
    except Exception as e:
        print(f"❌ Failed to update ingest.py: {e}")
        return False

def main():
    """Main function to find and configure Tesseract"""
    
    print("=== Tesseract Configuration Helper ===\n")
    
    # Find Tesseract installations
    found_paths = find_tesseract()
    
    if not found_paths:
        print("\n❌ Tesseract not found!")
        print("Please download and install Tesseract from:")
        print("https://github.com/UB-Mannheim/tesseract/wiki")
        print("\nAfter installation, run this script again.")
        return False
    
    # Test each found path
    working_paths = []
    for path in found_paths:
        if test_tesseract(path):
            working_paths.append(path)
    
    if working_paths:
        best_path = working_paths[0]
        print(f"\n🎯 Using Tesseract path: {best_path}")
        
        # Update ingest.py with the working path
        update_ingest_file(best_path)
        
        print("\n🎉 Tesseract configuration complete!")
        print("You can now upload images and extract text from them.")
        return True
    
    else:
        print("\n❌ No working Tesseract installation found")
        return False

if __name__ == "__main__":
    main()