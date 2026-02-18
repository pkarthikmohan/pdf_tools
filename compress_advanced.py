"""
Advanced PDF Compressor - Reduces PDF size aggressively
Uses image downscaling and quality reduction
"""

import os
import sys
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image
import io

def get_file_size_kb(filepath):
    """Get file size in KB"""
    return os.path.getsize(filepath) / 1024

def compress_pdf_advanced(input_pdf, output_pdf, target_kb=None, dpi=150, quality=70):
    """
    Aggressively compress PDF by rendering pages and compressing images
    
    Args:
        input_pdf: Path to input PDF
        output_pdf: Path to output PDF  
        target_kb: Target size in KB
        dpi: DPI for rendering (lower = smaller, default 150)
        quality: JPEG quality 1-100 (lower = smaller, default 70)
    """
    
    print(f"📄 Input: {input_pdf}")
    original_size = get_file_size_kb(input_pdf)
    print(f"📊 Original size: {original_size:.2f} KB")
    
    if target_kb:
        print(f"🎯 Target size: {target_kb} KB")
    
    doc = fitz.open(input_pdf)
    
    # Try different DPI/quality combinations to reach target
    configs = [
        (150, 70),  # Medium quality
        (120, 60),  # Lower quality
        (100, 50),  # Low quality
        (80, 40),   # Very low quality
        (72, 30),   # Minimal quality
        (50, 20),   # Ultra low (screen readable)
    ]
    
    if not target_kb:
        # Just use first config for max compression
        configs = [(100, 50)]
    
    best_output = None
    best_size = float('inf')
    
    for dpi_val, qual_val in configs:
        print(f"\n🔄 Trying DPI={dpi_val}, Quality={qual_val}%")
        
        temp_output = output_pdf.replace('.pdf', f'_temp_{dpi_val}_{qual_val}.pdf')
        
        # Create new PDF
        new_doc = fitz.open()
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Render page as image at specified DPI
            pix = page.get_pixmap(dpi=dpi_val)
            
            # Convert pixmap to PIL Image
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            # Compress as JPEG with specified quality
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='JPEG', quality=qual_val, optimize=True)
            img_bytes = img_buffer.getvalue()
            
            # Create new page and insert image
            new_page = new_doc.new_page(width=page.rect.width, height=page.rect.height)
            new_page.insert_image(new_page.rect, stream=img_bytes)
        
        # Save
        new_doc.save(temp_output, garbage=4, deflate=True, clean=True)
        new_doc.close()
        
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
                # Clean up old best
                if best_output and os.path.exists(best_output):
                    os.remove(best_output)
                best_output = temp_output
                best_size = compressed_size
            else:
                # This one is worse, delete it
                if os.path.exists(temp_output):
                    os.remove(temp_output)
        else:
            # No target, just save best compression
            if best_output and os.path.exists(best_output):
                os.remove(best_output)
            best_output = temp_output
            best_size = compressed_size
    
    doc.close()
    
    # Rename best to final
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
            print(f"   This PDF may have non-compressible content")
        
        return True
    else:
        print("❌ Compression failed")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("ADVANCED PDF COMPRESSOR")
    print("Converts pages to compressed images")
    print("=" * 60)
    
    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  python compress_advanced.py <input.pdf> [target_kb]")
        print("\nExamples:")
        print("  python compress_advanced.py document.pdf         (max compression)")
        print("  python compress_advanced.py document.pdf 300     (compress to 300 KB)")
        print("\n⚠️  NOTE: This converts PDF pages to images!")
        print("   Text will not be selectable in the output.")
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
    compress_pdf_advanced(input_pdf, output_pdf, target_kb)
    print("\n" + "=" * 60)
