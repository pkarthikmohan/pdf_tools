// Global variables
let selectedFiles = [];
let compressFile = null;
let extractPdf = null;
let extractPageCount = 0;
let deletePdf = null;
let deletePageCount = 0;
let selectedImages = [];

// DOM elements - Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// DOM elements - Merge
const pdfInput = document.getElementById('pdf-input');
const fileLabel = document.querySelector('.file-label');
const fileList = document.getElementById('file-list');
const filesList = document.getElementById('files');
const fileCount = document.getElementById('file-count');
const mergeBtn = document.getElementById('merge-btn');
const clearBtn = document.getElementById('clear-btn');
const compressCheckbox = document.getElementById('compress-checkbox');
const progress = document.getElementById('progress');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// DOM elements - Compress
const compressInput = document.getElementById('compress-input');
const compressFileInfo = document.getElementById('compress-file-info');
const compressFilename = document.getElementById('compress-filename');
const originalSize = document.getElementById('original-size');
const targetSizeInput = document.getElementById('target-size');
const compressFileBtn = document.getElementById('compress-file-btn');
const compressProgress = document.getElementById('compress-progress');
const compressProgressFill = document.getElementById('compress-progress-fill');
const compressProgressText = document.getElementById('compress-progress-text');

// DOM elements - Extract
const extractInput = document.getElementById('extract-input');
const extractFileInfo = document.getElementById('extract-file-info');
const extractFilename = document.getElementById('extract-filename');
const extractTotalPages = document.getElementById('extract-total-pages');
const extractPageSelector = document.getElementById('extract-page-selector');
const extractRangeInput = document.getElementById('extract-range-input');
const extractPageGrid = document.getElementById('extract-page-grid');
const extractBtn = document.getElementById('extract-btn');
const extractProgress = document.getElementById('extract-progress');
const extractProgressFill = document.getElementById('extract-progress-fill');
const extractProgressText = document.getElementById('extract-progress-text');

// DOM elements - Delete
const deleteInput = document.getElementById('delete-input');
const deleteFileInfo = document.getElementById('delete-file-info');
const deleteFilename = document.getElementById('delete-filename');
const deleteTotalPages = document.getElementById('delete-total-pages');
const deletePageSelector = document.getElementById('delete-page-selector');
const deleteRangeInput = document.getElementById('delete-range-input');
const deletePageGrid = document.getElementById('delete-page-grid');
const deleteBtn = document.getElementById('delete-btn');
const deleteProgress = document.getElementById('delete-progress');
const deleteProgressFill = document.getElementById('delete-progress-fill');
const deleteProgressText = document.getElementById('delete-progress-text');

// DOM elements - Image to PDF
const imageInput = document.getElementById('image-input');
const imageList = document.getElementById('image-list');
const imagesList = document.getElementById('images');
const imageCount = document.getElementById('image-count');
const convertBtn = document.getElementById('convert-btn');
const clearImagesBtn = document.getElementById('clear-images-btn');
const imageProgress = document.getElementById('image-progress');
const imageProgressFill = document.getElementById('image-progress-fill');
const imageProgressText = document.getElementById('image-progress-text');

// Event listeners - Tabs
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// Event listeners - Merge
pdfInput.addEventListener('change', handleFileSelect);
mergeBtn.addEventListener('click', mergePDFs);
clearBtn.addEventListener('click', clearFiles);

// Drag and drop event listeners - Merge
fileLabel.addEventListener('dragover', handleDragOver);
fileLabel.addEventListener('dragleave', handleDragLeave);
fileLabel.addEventListener('drop', handleDrop);

// Event listeners - Compress
compressInput.addEventListener('change', handleCompressFileSelect);
compressFileBtn.addEventListener('click', compressPDF);

// Event listeners - Extract
extractInput.addEventListener('change', handleExtractFileSelect);
extractRangeInput.addEventListener('input', handleExtractRangeInput);
extractBtn.addEventListener('click', extractPages);

// Event listeners - Delete
deleteInput.addEventListener('change', handleDeleteFileSelect);
deleteRangeInput.addEventListener('input', handleDeleteRangeInput);
deleteBtn.addEventListener('click', deletePages);

// Event listeners - Image to PDF
imageInput.addEventListener('change', handleImageSelect);
convertBtn.addEventListener('click', convertImagesToPDF);
clearImagesBtn.addEventListener('click', clearImages);

// Tab switching
function switchTab(tabName) {
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// Handle file selection
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    addFiles(files);
}

// Handle drag over
function handleDragOver(event) {
    event.preventDefault();
    fileLabel.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(event) {
    event.preventDefault();
    fileLabel.classList.remove('drag-over');
}

// Handle file drop
function handleDrop(event) {
    event.preventDefault();
    fileLabel.classList.remove('drag-over');
    
    const files = Array.from(event.dataTransfer.files).filter(file => file.type === 'application/pdf');
    addFiles(files);
}

// Add files to the list
function addFiles(files) {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
        alert('Please select valid PDF files.');
        return;
    }
    
    selectedFiles = [...selectedFiles, ...pdfFiles];
    updateFileList();
}

// Update file list display
function updateFileList() {
    filesList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const li = document.createElement('li');
        li.textContent = file.name;
        filesList.appendChild(li);
    });
    
    fileCount.textContent = selectedFiles.length;
    
    if (selectedFiles.length > 0) {
        fileList.classList.remove('hidden');
        mergeBtn.disabled = selectedFiles.length < 2;
    } else {
        fileList.classList.add('hidden');
        mergeBtn.disabled = true;
    }
}

// Clear all files
function clearFiles() {
    selectedFiles = [];
    pdfInput.value = '';
    updateFileList();
}

// Merge PDFs
async function mergePDFs() {
    if (selectedFiles.length < 2) {
        alert('Please select at least 2 PDF files to merge.');
        return;
    }
    
    // Disable button and show progress
    mergeBtn.disabled = true;
    progress.classList.remove('hidden');
    progressFill.style.width = '0%';
    progressText.textContent = 'Starting merge...';
    
    try {
        // Create a new PDF document
        const mergedPdf = await PDFLib.PDFDocument.create();
        
        // Process each file
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            progressText.textContent = `Processing ${file.name} (${i + 1}/${selectedFiles.length})...`;
            progressFill.style.width = `${((i + 1) / selectedFiles.length) * 80}%`;
            
            // Read file as array buffer
            const fileBuffer = await file.arrayBuffer();
            
            // Load the PDF
            const pdf = await PDFLib.PDFDocument.load(fileBuffer);
            
            // Copy all pages from the current PDF
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            
            // Add pages to merged PDF
            pages.forEach(page => {
                mergedPdf.addPage(page);
            });
        }
        
        progressText.textContent = 'Finalizing merged PDF...';
        progressFill.style.width = '90%';
        
        // Save the merged PDF with optional compression
        const saveOptions = {};
        
        if (compressCheckbox.checked) {
            progressText.textContent = 'Compressing merged PDF...';
            saveOptions.useObjectStreams = true;
            saveOptions.addDefaultPage = false;
        }
        
        const mergedPdfBytes = await mergedPdf.save(saveOptions);
        
        progressText.textContent = 'Download ready!';
        progressFill.style.width = '100%';
        
        // Create download link
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `merged_${Date.now()}.pdf`;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        
        // Reset after short delay
        setTimeout(() => {
            progress.classList.add('hidden');
            progressFill.style.width = '0%';
            mergeBtn.disabled = false;
            progressText.textContent = 'Processing...';
        }, 2000);
        
    } catch (error) {
        console.error('Error merging PDFs:', error);
        alert('An error occurred while merging PDFs. Please try again.');
        progress.classList.add('hidden');
        mergeBtn.disabled = false;
        progressFill.style.width = '0%';
    }
}

// ===== COMPRESS FUNCTIONS =====

// Handle compress file selection
function handleCompressFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        compressFile = file;
        displayCompressFileInfo(file);
    } else {
        alert('Please select a valid PDF file.');
    }
}

// Display compress file info
function displayCompressFileInfo(file) {
    compressFilename.textContent = file.name;
    const sizeInKB = (file.size / 1024).toFixed(2);
    originalSize.textContent = sizeInKB;
    
    compressFileInfo.classList.remove('hidden');
    compressFileBtn.disabled = false;
}

// Compress PDF
async function compressPDF() {
    if (!compressFile) {
        alert('Please select a PDF file to compress.');
        return;
    }
    
    // Disable button and show progress
    compressFileBtn.disabled = true;
    compressProgress.classList.remove('hidden');
    compressProgressFill.style.width = '0%';
    compressProgressText.textContent = 'Loading PDF...';
    
    try {
        // Read file
        const fileBuffer = await compressFile.arrayBuffer();
        const originalSizeKB = compressFile.size / 1024;
        
        compressProgressText.textContent = 'Analyzing PDF...';
        compressProgressFill.style.width = '20%';
        
        // Load PDF
        const pdfDoc = await PDFLib.PDFDocument.load(fileBuffer);
        
        compressProgressText.textContent = 'Compressing PDF...';
        compressProgressFill.style.width = '50%';
        
        // Get target size
        const targetSize = targetSizeInput.value ? parseFloat(targetSizeInput.value) : null;
        
        // Compression options
        let compressedBytes;
        let compressionLevel = 0;
        
        if (targetSize && targetSize > 0) {
            // Try to compress to target size
            compressProgressText.textContent = `Compressing to ${targetSize} KB...`;
            
            // Try multiple compression strategies
            const strategies = [
                { useObjectStreams: true, addDefaultPage: false },
                { useObjectStreams: false, addDefaultPage: false }
            ];
            
            for (let strategy of strategies) {
                compressedBytes = await pdfDoc.save(strategy);
                const compressedSizeKB = compressedBytes.length / 1024;
                
                if (compressedSizeKB <= targetSize) {
                    break;
                }
            }
            
            const finalSizeKB = compressedBytes.length / 1024;
            
            if (finalSizeKB > targetSize) {
                const proceed = confirm(
                    `Could not compress to ${targetSize} KB.\\n` +
                    `Best achievable: ${finalSizeKB.toFixed(2)} KB\\n\\n` +
                    `Download this version?`
                );
                
                if (!proceed) {
                    compressProgress.classList.add('hidden');
                    compressFileBtn.disabled = false;
                    return;
                }
            }
        } else {
            // Maximum compression
            compressProgressText.textContent = 'Applying maximum compression...';
            compressedBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false
            });
        }
        
        compressProgressText.textContent = 'Finalizing...';
        compressProgressFill.style.width = '90%';
        
        const compressedSizeKB = compressedBytes.length / 1024;
        const reduction = ((1 - compressedSizeKB / originalSizeKB) * 100).toFixed(1);
        
        compressProgressText.textContent = `Compressed! ${reduction}% reduction`;
        compressProgressFill.style.width = '100%';
        
        // Download
        const blob = new Blob([compressedBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `compressed_${compressFile.name}`;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        
        // Show result
        setTimeout(() => {
            alert(
                `Original: ${originalSizeKB.toFixed(2)} KB\\n` +
                `Compressed: ${compressedSizeKB.toFixed(2)} KB\\n` +
                `Reduction: ${reduction}%`
            );
            
            compressProgress.classList.add('hidden');
            compressFileBtn.disabled = false;
            compressProgressFill.style.width = '0%';
            compressProgressText.textContent = 'Processing...';
        }, 1500);
        
    } catch (error) {
        console.error('Error compressing PDF:', error);
        alert('An error occurred while compressing the PDF. Please try again.');
        compressProgress.classList.add('hidden');
        compressFileBtn.disabled = false;
        compressProgressFill.style.width = '0%';
    }
}

// ===== EXTRACT PAGES FUNCTIONS =====

// Handle extract file selection
async function handleExtractFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        extractPdf = file;
        await displayExtractFileInfo(file);
    } else {
        alert('Please select a valid PDF file.');
    }
}

// Display extract file info
async function displayExtractFileInfo(file) {
    extractFilename.textContent = file.name;
    
    // Load PDF to get page count
    const fileBuffer = await file.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(fileBuffer);
    extractPageCount = pdf.getPageCount();
    
    extractTotalPages.textContent = extractPageCount;
    extractFileInfo.classList.remove('hidden');
    extractPageSelector.classList.remove('hidden');
    
    // Create page grid
    createPageGrid(extractPageGrid, extractPageCount, 'extract');
    
    extractBtn.disabled = false;
}

// Create page grid for selection
function createPageGrid(gridElement, pageCount, type) {
    gridElement.innerHTML = '';
    
    for (let i = 1; i <= pageCount; i++) {
        const pageItem = document.createElement('div');
        pageItem.className = 'page-item';
        pageItem.textContent = i;
        pageItem.dataset.page = i;
        pageItem.dataset.type = type;
        
        pageItem.addEventListener('click', function() {
            this.classList.toggle('selected');
            updateButtonState(type);
        });
        
        gridElement.appendChild(pageItem);
    }
}

// Handle extract range input
function handleExtractRangeInput() {
    const range = extractRangeInput.value;
    updateGridFromRange(extractPageGrid, range, 'extract');
}

// Update grid selection from range string
function updateGridFromRange(gridElement, rangeStr, type) {
    // Clear all selections
    gridElement.querySelectorAll('.page-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    if (!rangeStr.trim()) return;
    
    const pages = parsePageRange(rangeStr);
    pages.forEach(pageNum => {
        const pageItem = gridElement.querySelector(`[data-page="${pageNum}"][data-type="${type}"]`);
        if (pageItem) {
            pageItem.classList.add('selected');
        }
    });
    
    updateButtonState(type);
}

// Parse page range string (e.g., "1-3, 5, 7-9")
function parsePageRange(rangeStr) {
    const pages = new Set();
    const parts = rangeStr.split(',');
    
    parts.forEach(part => {
        part = part.trim();
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    pages.add(i);
                }
            }
        } else {
            const num = parseInt(part);
            if (!isNaN(num)) {
                pages.add(num);
            }
        }
    });
    
    return Array.from(pages).sort((a, b) => a - b);
}

// Get selected pages from grid
function getSelectedPages(gridElement) {
    const selectedItems = gridElement.querySelectorAll('.page-item.selected');
    return Array.from(selectedItems).map(item => parseInt(item.dataset.page));
}

// Update button state
function updateButtonState(type) {
    if (type === 'extract') {
        const selectedPages = getSelectedPages(extractPageGrid);
        extractBtn.disabled = selectedPages.length === 0;
    } else if (type === 'delete') {
        const selectedPages = getSelectedPages(deletePageGrid);
        deleteBtn.disabled = selectedPages.length === 0;
    }
}

// Extract pages
async function extractPages() {
    const selectedPages = getSelectedPages(extractPageGrid);
    
    if (selectedPages.length === 0) {
        alert('Please select at least one page to extract.');
        return;
    }
    
    extractBtn.disabled = true;
    extractProgress.classList.remove('hidden');
    extractProgressFill.style.width = '0%';
    extractProgressText.textContent = 'Loading PDF...';
    
    try {
        const fileBuffer = await extractPdf.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(fileBuffer);
        
        extractProgressText.textContent = 'Extracting pages...';
        extractProgressFill.style.width = '30%';
        
        // Create new PDF with selected pages
        const newPdf = await PDFLib.PDFDocument.create();
        
        for (let i = 0; i < selectedPages.length; i++) {
            const pageNum = selectedPages[i] - 1; // Convert to 0-based index
            const [copiedPage] = await newPdf.copyPages(pdf, [pageNum]);
            newPdf.addPage(copiedPage);
            
            const progress = 30 + ((i + 1) / selectedPages.length * 60);
            extractProgressFill.style.width = `${progress}%`;
        }
        
        extractProgressText.textContent = 'Saving...';
        extractProgressFill.style.width = '95%';
        
        const pdfBytes = await newPdf.save();
        
        extractProgressText.textContent = 'Download ready!';
        extractProgressFill.style.width = '100%';
        
        // Download
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `extracted_pages_${Date.now()}.pdf`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        setTimeout(() => {
            extractProgress.classList.add('hidden');
            extractBtn.disabled = false;
            extractProgressFill.style.width = '0%';
        }, 2000);
        
    } catch (error) {
        console.error('Error extracting pages:', error);
        alert('An error occurred while extracting pages. Please try again.');
        extractProgress.classList.add('hidden');
        extractBtn.disabled = false;
        extractProgressFill.style.width = '0%';
    }
}

// ===== DELETE PAGES FUNCTIONS =====

// Handle delete file selection
async function handleDeleteFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        deletePdf = file;
        await displayDeleteFileInfo(file);
    } else {
        alert('Please select a valid PDF file.');
    }
}

// Display delete file info
async function displayDeleteFileInfo(file) {
    deleteFilename.textContent = file.name;
    
    // Load PDF to get page count
    const fileBuffer = await file.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(fileBuffer);
    deletePageCount = pdf.getPageCount();
    
    deleteTotalPages.textContent = deletePageCount;
    deleteFileInfo.classList.remove('hidden');
    deletePageSelector.classList.remove('hidden');
    
    // Create page grid
    createPageGrid(deletePageGrid, deletePageCount, 'delete');
    
    deleteBtn.disabled = false;
}

// Handle delete range input
function handleDeleteRangeInput() {
    const range = deleteRangeInput.value;
    updateGridFromRange(deletePageGrid, range, 'delete');
}

// Delete pages
async function deletePages() {
    const selectedPages = getSelectedPages(deletePageGrid);
    
    if (selectedPages.length === 0) {
        alert('Please select at least one page to delete.');
        return;
    }
    
    if (selectedPages.length === deletePageCount) {
        alert('You cannot delete all pages. At least one page must remain.');
        return;
    }
    
    deleteBtn.disabled = true;
    deleteProgress.classList.remove('hidden');
    deleteProgressFill.style.width = '0%';
    deleteProgressText.textContent = 'Loading PDF...';
    
    try {
        const fileBuffer = await deletePdf.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(fileBuffer);
        
        deleteProgressText.textContent = 'Deleting pages...';
        deleteProgressFill.style.width = '30%';
        
        // Create new PDF with pages NOT in selectedPages
        const newPdf = await PDFLib.PDFDocument.create();
        const totalPages = pdf.getPageCount();
        
        let copiedCount = 0;
        for (let i = 0; i < totalPages; i++) {
            const pageNum = i + 1; // Convert to 1-based
            
            if (!selectedPages.includes(pageNum)) {
                const [copiedPage] = await newPdf.copyPages(pdf, [i]);
                newPdf.addPage(copiedPage);
                copiedCount++;
                
                const progress = 30 + (copiedCount / (totalPages - selectedPages.length) * 60);
                deleteProgressFill.style.width = `${progress}%`;
            }
        }
        
        deleteProgressText.textContent = 'Saving...';
        deleteProgressFill.style.width = '95%';
        
        const pdfBytes = await newPdf.save();
        
        deleteProgressText.textContent = 'Download ready!';
        deleteProgressFill.style.width = '100%';
        
        // Download
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `deleted_pages_${Date.now()}.pdf`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        setTimeout(() => {
            deleteProgress.classList.add('hidden');
            deleteBtn.disabled = false;
            deleteProgressFill.style.width = '0%';
        }, 2000);
        
    } catch (error) {
        console.error('Error deleting pages:', error);
        alert('An error occurred while deleting pages. Please try again.');
        deleteProgress.classList.add('hidden');
        deleteBtn.disabled = false;
        deleteProgressFill.style.width = '0%';
    }
}

// ===== IMAGE TO PDF FUNCTIONS =====

// Handle image selection
function handleImageSelect(event) {
    const files = Array.from(event.target.files);
    addImages(files);
}

// Add images to the list
function addImages(files) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        alert('Please select valid image files (JPG, PNG, WEBP, etc.).');
        return;
    }
    
    selectedImages = [...selectedImages, ...imageFiles];
    updateImageList();
}

// Update image list display
function updateImageList() {
    imagesList.innerHTML = '';
    
    selectedImages.forEach((file, index) => {
        const li = document.createElement('li');
        li.textContent = file.name;
        imagesList.appendChild(li);
    });
    
    imageCount.textContent = selectedImages.length;
    
    if (selectedImages.length > 0) {
        imageList.classList.remove('hidden');
        convertBtn.disabled = false;
    } else {
        imageList.classList.add('hidden');
        convertBtn.disabled = true;
    }
}

// Clear all images
function clearImages() {
    selectedImages = [];
    imageInput.value = '';
    updateImageList();
}

// Convert images to PDF
async function convertImagesToPDF() {
    if (selectedImages.length === 0) {
        alert('Please select at least one image.');
        return;
    }
    
    convertBtn.disabled = true;
    imageProgress.classList.remove('hidden');
    imageProgressFill.style.width = '0%';
    imageProgressText.textContent = 'Creating PDF...';
    
    try {
        // Create a new PDF document
        const pdfDoc = await PDFLib.PDFDocument.create();
        
        for (let i = 0; i < selectedImages.length; i++) {
            const file = selectedImages[i];
            imageProgressText.textContent = `Processing ${file.name} (${i + 1}/${selectedImages.length})...`;
            imageProgressFill.style.width = `${((i + 1) / selectedImages.length) * 90}%`;
            
            // Read image as array buffer
            const imageBytes = await file.arrayBuffer();
            
            // Determine image type and embed
            let image;
            if (file.type === 'image/png') {
                image = await pdfDoc.embedPng(imageBytes);
            } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                image = await pdfDoc.embedJpg(imageBytes);
            } else {
                // For other formats, convert to data URL and then embed as PNG
                const img = await createImageBitmap(file);
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                const pngDataUrl = canvas.toDataURL('image/png');
                const pngBytes = await fetch(pngDataUrl).then(res => res.arrayBuffer());
                image = await pdfDoc.embedPng(pngBytes);
            }
            
            // Get image dimensions
            const imgWidth = image.width;
            const imgHeight = image.height;
            
            // Create page with image dimensions (or scale to fit A4)
            const maxWidth = 595; // A4 width in points
            const maxHeight = 842; // A4 height in points
            
            let pageWidth = imgWidth;
            let pageHeight = imgHeight;
            
            // Scale down if image is larger than A4
            if (imgWidth > maxWidth || imgHeight > maxHeight) {
                const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
                pageWidth = imgWidth * scale;
                pageHeight = imgHeight * scale;
            }
            
            // Add page
            const page = pdfDoc.addPage([pageWidth, pageHeight]);
            
            // Draw image on page
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: pageWidth,
                height: pageHeight
            });
        }
        
        imageProgressText.textContent = 'Saving PDF...';
        imageProgressFill.style.width = '95%';
        
        // Save PDF
        const pdfBytes = await pdfDoc.save();
        
        imageProgressText.textContent = 'Download ready!';
        imageProgressFill.style.width = '100%';
        
        // Download
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `images_to_pdf_${Date.now()}.pdf`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        setTimeout(() => {
            imageProgress.classList.add('hidden');
            convertBtn.disabled = false;
            imageProgressFill.style.width = '0%';
            imageProgressText.textContent = 'Processing...';
        }, 2000);
        
    } catch (error) {
        console.error('Error converting images to PDF:', error);
        alert('An error occurred while converting images to PDF. Please try again.');
        imageProgress.classList.add('hidden');
        convertBtn.disabled = false;
        imageProgressFill.style.width = '0%';
    }
}
