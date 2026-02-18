# PDF Tools - Offline Merger & Compressor

Complete offline PDF toolkit with merge and compression capabilities.

## 🌐 Web Interface (Basic)

**Files:** `index.html`, `styles.css`, `app.js`

### Features:
- ✅ Merge multiple PDFs
- ✅ Basic compression (structural optimization)
- ✅ Works in browser
- ⚠️ Limited compression (5-20% reduction)

### How to Use:
1. Open `index.html` in any browser
2. Use Merge or Compress tabs

---

## 🐍 Python Compressor (Advanced)

**File:** `compress_pdf.py`

### Features:
- ✅ **Real compression** - Compresses images within PDFs
- ✅ **Target size** - Reduces to specific KB size
- ✅ **Automatic quality adjustment** - Tries different compression levels
- ✅ **Offline** - No internet required
- ✅ **50-90% reduction** possible on image-heavy PDFs

### Installation:

1. **Install Python** (if not installed): https://www.python.org/
2. **Run installer:**
   ```
   Double-click: install.bat
   ```
   OR manually:
   ```
   pip install -r requirements.txt
   ```

### Usage:

#### Method 1: Command Line
```bash
# Maximum compression
python compress_pdf.py document.pdf

# Compress to specific size (500 KB)
python compress_pdf.py document.pdf 500
```

#### Method 2: Drag & Drop
1. Drag PDF file onto `compress.bat`
2. Enter target size when prompted (or press Enter for max compression)

#### Method 3: Batch File
```bash
compress.bat document.pdf 500
```

### Examples:

```bash
# Compress presentation.pdf to maximum
python compress_pdf.py presentation.pdf

# Compress report.pdf to exactly/below 1000 KB (1 MB)
python compress_pdf.py report.pdf 1000

# Compress images.pdf to 200 KB
python compress_pdf.py images.pdf 200
```

### Output:
- Original: `document.pdf`
- Compressed: `document_compressed.pdf`

---

## 📊 Comparison

| Feature | Web Interface | Python Compressor |
|---------|---------------|-------------------|
| Offline | ✅ Yes | ✅ Yes |
| Installation | None | Python + packages |
| Merge PDFs | ✅ Yes | ❌ No (use web) |
| Image Compression | ❌ No | ✅ Yes |
| Target Size | ⚠️ Limited | ✅ Accurate |
| Typical Reduction | 5-20% | 50-90% |

---

## 🎯 When to Use What:

- **Merging PDFs** → Use Web Interface
- **Light compression** → Use Web Interface
- **Heavy compression** → Use Python Compressor
- **Target specific size** → Use Python Compressor
- **Image-heavy PDFs** → Use Python Compressor

---

## 📁 File Structure:

```
pdf_merger_offline/
├── index.html          # Web interface
├── styles.css          # Web styling
├── app.js             # Web logic
├── compress_pdf.py    # Python compressor (POWERFUL)
├── requirements.txt   # Python dependencies
├── install.bat        # Auto-installer
├── compress.bat       # Drag-drop helper
└── README.md          # This file
```

---

## 🚀 Quick Start:

1. **For Merging:** Open `index.html`
2. **For Compression:** 
   - Install: `install.bat`
   - Use: `python compress_pdf.py yourfile.pdf 500`

---

## ⚠️ Troubleshooting:

**"Python not found"**
- Install Python from https://www.python.org/
- Check "Add to PATH" during installation

**"Module not found"**
- Run `install.bat` again
- Or: `pip install -r requirements.txt`

**"Cannot compress to target size"**
- PDF may have non-compressible content
- Try lower quality (script auto-adjusts)
- Some PDFs have minimum sizes

---

## 💡 Tips:

- Start with target size slightly higher than needed
- Image-heavy PDFs compress better
- Text-only PDFs have limited compression
- Lower quality = smaller size (quality: 10-100)

---

Made with ❤️ for offline PDF processing
