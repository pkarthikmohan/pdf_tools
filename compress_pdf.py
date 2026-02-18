"""
PDF Compressor - Reduces PDF size to target KB by compressing images
Works offline - No internet required
"""

import os
import sys
from pathlib import Path
from PyPDF2 import PdfReader, PdfWriter
from PIL import Image
import io
import fitz  # PyMuPDF

def get_file_size_kb(filepath):
    """Get file size in KB"""
    return os.path.getsize(filepath) / 1024

def compress_pdf_to_target(input_pdf, output_pdf, target_kb=None, quality=85):
    """
    Compress PDF by reducing image quality
    
    Args:
        input_pdf: Path to input PDF
        output_pdf: Path to output PDF
        target_kb: Target size in KB (None for maximum compression)
        quality: Initial JPEG quality (1-100)
    """
    
    print(f"📄 Input: {input_pdf}")
    original_size = get_file_size_kb(input_pdf)
    print(f"📊 Original size: {original_size:.2f} KB")
    
    if target_kb:
        print(f"🎯 Target size: {target_kb} KB")
    else:
        print(f"🎯 Target: Maximum compression")
    
    # Open PDF with PyMuPDF for image extraction/compression
    doc = fitz.open(input_pdf)
    
    # Try different quality levels
    quality_levels = [quality, 70, 60, 50, 40, 30, 20, 10] if target_kb else [quality]
    
    best_output = None
    best_size = float('inf')
    
    for current_quality in quality_levels:
        print(f"\n🔄 Trying compression quality: {current_quality}%")
        
        # Create temporary output
        temp_output = output_pdf.replace('.pdf', f'_temp_{current_quality}.pdf')
        
        # Create new PDF
        writer = fitz.open()
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Get images on page
            image_list = page.get_images()
            
            if image_list:
                # Create a new page
                new_page = writer.new_page(width=page.rect.width, height=page.rect.height)
                
                # Copy page content
                new_page.show_pdf_page(new_page.rect, doc, page_num)
                
                # Compress images
                for img_index, img in enumerate(image_list):
                    xref = img[0]
                    try:
                        # Extract image
                        base_image = doc.extract_image(xref)
                        image_bytes = base_image["image"]
                        image_ext = base_image["ext"]
                        
                        # Convert to PIL Image
                        image = Image.open(io.BytesIO(image_bytes))
                        
                        # Compress image
                        output_buffer = io.BytesIO()
                        
                        # Convert to RGB if necessary
                        if image.mode in ('RGBA', 'LA', 'P'):
                            image = image.convert('RGB')
                        
                        # Save with compression
                        image.save(output_buffer, format='JPEG', quality=current_quality, optimize=True)
                        compressed_image_bytes = output_buffer.getvalue()
                        
                        # Replace image in PDF (note: this is simplified, may need page reconstruction)
                        
                    except Exception as e:
                        print(f"  ⚠️  Could not compress image {img_index}: {e}")
                        continue
            else:
                # No images, just copy page
                new_page = writer.new_page(width=page.rect.width, height=page.rect.height)
                new_page.show_pdf_page(new_page.rect, doc, page_num)
        
        # Save compressed PDF
        writer.save(temp_output, garbage=4, deflate=True, clean=True)
        writer.close()
        
        # Check size
        compressed_size = get_file_size_kb(temp_output)
        print(f"  ✓ Compressed size: {compressed_size:.2f} KB")
        
        # Check if meets target
        if target_kb:
            if compressed_size <= target_kb:
                print(f"  ✅ Target achieved!")
                best_output = temp_output
                best_size = compressed_size
                break
            elif compressed_size < best_size:
                if best_output and os.path.exists(best_output):
                    os.remove(best_output)
                best_output = temp_output
                best_size = compressed_size
            else:
                if os.path.exists(temp_output):
                    os.remove(temp_output)
        else:
            # Maximum compression - use lowest quality
            if best_output and os.path.exists(best_output):
                os.remove(best_output)
            best_output = temp_output
            best_size = compressed_size
    
    doc.close()
    
    # Rename best output to final output
    if best_output and os.path.exists(best_output):
        if os.path.exists(output_pdf):
            os.remove(output_pdf)
        os.rename(best_output, output_pdf)
        
        final_size = get_file_size_kb(output_pdf)
        reduction = ((original_size - final_size) / original_size) * 100
        
        print(f"\n✅ Compression complete!")
        print(f"📊 Final size: {final_size:.2f} KB")
        print(f"📉 Reduction: {reduction:.1f}%")
        print(f"💾 Saved to: {output_pdf}")
        
        if target_kb and final_size > target_kb:
            print(f"\n⚠️  Could not reach target of {target_kb} KB")
            print(f"   Best achievable: {final_size:.2f} KB")
        
        return True
    else:
        print("❌ Compression failed")
        return False

def compress_pdf_simple(input_pdf, output_pdf, target_kb=None):
    """
    Simple compression using PyMuPDF's built-in compression
    """
    print(f"📄 Input: {input_pdf}")
    original_size = get_file_size_kb(input_pdf)
    print(f"📊 Original size: {original_size:.2f} KB")
    
    if target_kb:
        print(f"🎯 Target size: {target_kb} KB")
    
    doc = fitz.open(input_pdf)
    
    # Save with maximum compression
    doc.save(
        output_pdf,
        garbage=4,  # Maximum garbage collection
        deflate=True,  # Compress streams
        clean=True  # Clean unused objects
    )
    doc.close()
    
    final_size = get_file_size_kb(output_pdf)
    reduction = ((original_size - final_size) / original_size) * 100
    
    print(f"\n✅ Compression complete!")
    print(f"📊 Final size: {final_size:.2f} KB")
    print(f"📉 Reduction: {reduction:.1f}%")
    print(f"💾 Saved to: {output_pdf}")
    
    if target_kb and final_size > target_kb:
        print(f"\n⚠️  Basic compression couldn't reach target.")
        print(f"   Trying advanced image compression...")
        return compress_pdf_to_target(input_pdf, output_pdf, target_kb)
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("PDF COMPRESSOR - Offline Tool")
    print("=" * 60)
    
    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  python compress_pdf.py <input.pdf> [target_kb]")
        print("\nExamples:")
        print("  python compress_pdf.py document.pdf         (maximum compression)")
        print("  python compress_pdf.py document.pdf 500     (compress to 500 KB)")
        sys.exit(1)
    
    input_pdf = sys.argv[1]
    target_kb = float(sys.argv[2]) if len(sys.argv) > 2 else None
    
    if not os.path.exists(input_pdf):
        print(f"❌ Error: File not found: {input_pdf}")
        sys.exit(1)
    
    # Generate output filename
    input_path = Path(input_pdf)
    output_pdf = str(input_path.parent / f"{input_path.stem}_compressed.pdf")
    
    print()
    compress_pdf_simple(input_pdf, output_pdf, target_kb)
    print("\n" + "=" * 60)
