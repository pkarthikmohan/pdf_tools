// ===========================
// VIEW NAVIGATION
// ===========================

function showView(viewName) {
    const views = document.querySelectorAll('.view-container');
    views.forEach(view => view.classList.remove('active'));
    
    document.getElementById(viewName + '-view').classList.add('active');
    
    // Update navbar
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.textContent.toLowerCase().includes(viewName) || 
            (viewName === 'home' && link.textContent === 'Home')) {
            link.classList.add('active');
        }
    });
}

function showTool(toolName) {
    showView('tool');
    renderToolWorkspace(toolName);
}

// ===========================
// TOOL WORKSPACE RENDERER
// ===========================

const toolConfigs = {
    merge: {
        title: '🔗 Merge PDF',
        description: 'Combine multiple PDF files into one document',
        multiple: true,
        acceptedFormats: '.pdf',
        options: ``,
        actionText: 'Merge PDFs',
        handler: mergePDFs
    },
    split: {
        title: '✂️ Split PDF',
        description: 'Separate one PDF into multiple files',
        multiple: false,
        acceptedFormats: '.pdf',
        options: `
            <div class="option-group">
                <label>Split Method</label>
                <select id="split-method">
                    <option value="pages">Split by page ranges (e.g., 1-3, 4-6)</option>
                    <option value="every">Extract every N pages</option>
                    <option value="custom">Custom ranges</option>
                </select>
            </div>
            <div class="option-group">
                <label>Page Ranges</label>
                <input type="text" id="split-ranges" placeholder="e.g., 1-3, 5-7, 9">
                <div class="option-hint">Specify page ranges separated by commas</div>
            </div>
        `,
        actionText: 'Split PDF',
        handler: splitPDF
    },
    delete: {
        title: '🗑️ Remove Pages',
        description: 'Delete unwanted pages from your PDF',
        multiple: false,
        acceptedFormats: '.pdf',
        options: `
            <div class="option-group">
                <label>Pages to Remove</label>
                <input type="text" id="delete-pages" placeholder="e.g., 1-3, 5, 7-9">
                <div class="option-hint">Enter page numbers or ranges (1-based)</div>
            </div>
            <div id="delete-grid"></div>
        `,
        actionText: 'Remove Pages',
        handler: deletePagesFromPDF
    },
    extract: {
        title: '📤 Extract Pages',
        description: 'Save specific pages as a new PDF file',
        multiple: false,
        acceptedFormats: '.pdf',
        options: `
            <div class="option-group">
                <label>Pages to Extract</label>
                <input type="text" id="extract-pages" placeholder="e.g., 1-3, 5, 7-9">
                <div class="option-hint">Enter page numbers or ranges (1-based)</div>
            </div>
            <div id="extract-grid"></div>
        `,
        actionText: 'Extract Pages',
        handler: extractPagesFromPDF
    },
    compress: {
        title: '🗜️ Compress PDF',
        description: 'Reduce PDF file size while maintaining quality',
        multiple: false,
        acceptedFormats: '.pdf',
        options: `
            <div class="option-group">
                <label>Compression Level</label>
                <select id="compress-level">
                    <option value="basic">Basic (Browser-based, 5-20% reduction)</option>
                    <option value="advanced">Advanced (Python required, 50-90% reduction)</option>
                </select>
            </div>
            <div class="option-group" id="target-size-group" style="display:none;">
                <label>Target File Size (KB)</label>
                <input type="number" id="target-size" placeholder="e.g., 300">
                <div class="option-hint">Requires compress_advanced.py script</div>
            </div>
        `,
        actionText: 'Compress PDF',
        handler: compressPDF
    },
    image: {
        title: '🖼️ Image to PDF',
        description: 'Convert JPG, PNG images into PDF format',
        multiple: true,
        acceptedFormats: '.jpg,.jpeg,.png,.webp',
        options: `
            <div class="option-group">
                <label>Page Size</label>
                <select id="page-size">
                    <option value="a4">A4 (210 x 297 mm)</option>
                    <option value="letter">Letter (8.5 x 11 in)</option>
                    <option value="fit">Fit to image size</option>
                </select>
            </div>
        `,
        actionText: 'Convert to PDF',
        handler: convertImagesToPDF
    },
    'word-to-pdf': {
        title: '📝 Word to PDF',
        description: 'Convert DOCX documents to PDF format',
        multiple: true,
        acceptedFormats: '.docx',
        options: `
            <div class="option-group">
                <label>Paper Size</label>
                <select id="doc-page-size">
                    <option value="a4">A4 (210 x 297 mm)</option>
                    <option value="letter">Letter (8.5 x 11 in)</option>
                </select>
            </div>
            <div class="option-group">
                <label>Margins</label>
                <select id="doc-margins">
                    <option value="normal">Normal (1 inch)</option>
                    <option value="narrow">Narrow (0.5 inch)</option>
                    <option value="wide">Wide (1.5 inch)</option>
                </select>
            </div>
            <div class="option-group" style="background: #E8F5E9; padding: 1rem; border-radius: 8px; border-left: 4px solid #4CAF50; margin-top: 1rem;">
                <p style="margin: 0; color: #2E7D32; font-size: 0.9rem;">
                    <strong>✅ High-Quality Conversion:</strong> Uses advanced rendering engine to preserve fonts, formatting, styles, tables, and layout - similar to Adobe's converter. Text remains selectable in the PDF.
                </p>
            </div>
        `,
        actionText: 'Convert to PDF',
        handler: convertWordToPDF
    },
    'excel-to-pdf': {
        title: '📊 Excel to PDF',
        description: 'Convert XLSX spreadsheets to PDF format',
        multiple: false,
        acceptedFormats: '.xlsx',
        options: `
            <div class="option-group" style="background: #FFF3CD; padding: 1rem; border-radius: 8px; border-left: 4px solid #F0B90B;">
                <p style="margin: 0; color: #856404;">
                    <strong>⚠️ Browser Limitation:</strong> Excel to PDF conversion requires complex spreadsheet rendering not available in browsers.
                    <br><br>
                    <strong>Recommended method:</strong> Open your XLSX file in Excel/LibreOffice Calc → File → Save As → PDF
                </p>
            </div>
        `,
        actionText: 'Learn How to Convert',
        handler: showOfficeConversionHelp
    },
    'ppt-to-pdf': {
        title: '📽️ PowerPoint to PDF',
        description: 'Convert PPTX presentations to PDF format',
        multiple: false,
        acceptedFormats: '.pptx',
        options: `
            <div class="option-group" style="background: #FFF3CD; padding: 1rem; border-radius: 8px; border-left: 4px solid #F0B90B;">
                <p style="margin: 0; color: #856404;">
                    <strong>⚠️ Browser Limitation:</strong> PowerPoint to PDF conversion requires slide rendering not available in browsers.
                    <br><br>
                    <strong>Recommended method:</strong> Open your XLSX file in Excel/LibreOffice Calc → File → Save As → PDF
                </p>
            </div>
        `,
        actionText: 'Learn How to Convert',
        handler: showOfficeConversionHelp
    },
    'ppt-to-pdf': {
        title: '📽️ PowerPoint to PDF',
        description: 'Convert PPTX presentations to PDF format',
        multiple: true,
        acceptedFormats: '.ppt,.pptx',
        options: `
            <div class="option-group" style="background: #FFF3CD; padding: 1rem; border-radius: 8px; border-left: 4px solid #F0B90B;">
                <p style="margin: 0; color: #856404;">
                    <strong>⚠️ Browser Limitation:</strong> Direct PowerPoint to PDF conversion requires Microsoft Office or LibreOffice installed on your system.
                    <br><br>
                    <strong>Recommended method:</strong> Open your PPTX file in PowerPoint/LibreOffice Impress → File → Save As → PDF
                </p>
            </div>
        `,
        actionText: 'Learn How to Convert',
        handler: showOfficeConversionHelp
    },
    'pdf-to-word': {
        title: '📝 PDF to Word',
        description: 'Convert PDF to editable DOCX document',
        multiple: false,
        acceptedFormats: '.pdf',
        options: `
            <div class="option-group" style="background: #FFF3CD; padding: 1rem; border-radius: 8px; border-left: 4px solid #F0B90B;">
                <p style="margin: 0; color: #856404;">
                    <strong>⚠️ Feature Unavailable Offline:</strong> PDF to Word conversion requires advanced text extraction and formatting that cannot run in a browser.
                    <br><br>
                    <strong>Suggested alternatives:</strong>
                    <br>• Use Adobe Acrobat (commercial)
                    <br>• Use online services like iLovePDF.com or Smallpdf.com
                    <br>• Install desktop software like PDFtk or PyPDF tools
                </p>
            </div>
        `,
        actionText: 'View Alternatives',
        handler: showPDFConversionHelp
    },
    'pdf-to-excel': {
        title: '📊 PDF to Excel',
        description: 'Extract tables from PDF to XLSX format',
        multiple: false,
        acceptedFormats: '.pdf',
        options: `
            <div class="option-group" style="background: #FFF3CD; padding: 1rem; border-radius: 8px; border-left: 4px solid #F0B90B;">
                <p style="margin: 0; color: #856404;">
                    <strong>⚠️ Feature Unavailable Offline:</strong> PDF to Excel conversion requires table detection and data extraction that cannot run in a browser.
                    <br><br>
                    <strong>Suggested alternatives:</strong>
                    <br>• Use Adobe Acrobat (commercial)
                    <br>• Use online services like iLovePDF.com or Smallpdf.com
                    <br>• Install Tabula (open-source desktop tool)
                </p>
            </div>
        `,
        actionText: 'View Alternatives',
        handler: showPDFConversionHelp
    },
    'pdf-to-ppt': {
        title: '📽️ PDF to PowerPoint',
        description: 'Convert PDF pages to PPTX slides',
        multiple: false,
        acceptedFormats: '.pdf',
        options: `
            <div class="option-group" style="background: #FFF3CD; padding: 1rem; border-radius: 8px; border-left: 4px solid #F0B90B;">
                <p style="margin: 0; color: #856404;">
                    <strong>⚠️ Feature Unavailable Offline:</strong> PDF to PowerPoint conversion requires advanced content extraction that cannot run in a browser.
                    <br><br>
                    <strong>Suggested alternatives:</strong>
                    <br>• Use Adobe Acrobat (commercial)
                    <br>• Use online services like iLovePDF.com or Smallpdf.com
                    <br>• Manually copy content from PDF to PowerPoint
                </p>
            </div>
        `,
        actionText: 'View Alternatives',
        handler: showPDFConversionHelp
    },
    'pdf-to-image': {
        title: '🖼️ PDF to Image',
        description: 'Convert PDF pages to JPG or PNG images',
        multiple: false,
        acceptedFormats: '.pdf',
        options: `
            <div class="option-group">
                <label>Output Format</label>
                <select id="image-format">
                    <option value="png">PNG (High Quality, Larger Size)</option>
                    <option value="jpeg">JPEG (Smaller Size, Good Quality)</option>
                </select>
            </div>
            <div class="option-group">
                <label>Image Quality</label>
                <select id="image-quality">
                    <option value="high">High (300 DPI)</option>
                    <option value="medium" selected>Medium (150 DPI)</option>
                    <option value="low">Low (72 DPI)</option>
                </select>
            </div>
            <div class="option-group">
                <label>Pages to Convert</label>
                <input type="text" id="pdf-to-image-pages" placeholder="e.g., 1-3, 5, 7 (leave empty for all)">
                <div class="option-hint">Leave empty to convert all pages</div>
            </div>
        `,
        actionText: 'Convert to Images',
        handler: convertPDFToImages
    }
};

function renderToolWorkspace(toolName) {
    const config = toolConfigs[toolName];
    if (!config) return;
    
    document.getElementById('tool-title').textContent = config.title;
    document.getElementById('tool-description').textContent = config.description;
    
    const workspace = document.getElementById('tool-workspace');
    workspace.innerHTML = `
        <div class="upload-area" id="upload-area-${toolName}" 
             ondrop="handleDrop(event, '${toolName}')" 
             ondragover="handleDragOver(event)"
             ondragleave="handleDragLeave(event)"
             onclick="document.getElementById('file-input-${toolName}').click()">
            <div class="upload-icon">📁</div>
            <h3>Click to select ${config.multiple ? 'files' : 'file'}</h3>
            <p>or drag and drop ${config.multiple ? 'PDF files' : 'a file'} here</p>
            <input type="file" 
                   id="file-input-${toolName}" 
                   class="file-input" 
                   accept="${config.acceptedFormats}"
                   ${config.multiple ? 'multiple' : ''}
                   onchange="handleFileSelect(event, '${toolName}')">
        </div>
        
        <div class="file-list" id="file-list-${toolName}" style="display:none;">
            <h3>Selected ${config.multiple ? 'Files' : 'File'}</h3>
            <div id="files-container-${toolName}"></div>
            <button class="clear-btn" onclick="clearFiles('${toolName}')">Clear All</button>
        </div>
        
        ${config.options ? `<div class="options-section">${config.options}</div>` : ''}
        
        <button class="action-btn" id="action-btn-${toolName}" onclick="toolConfigs['${toolName}'].handler('${toolName}')" disabled>
            ${config.actionText}
        </button>
        
        <div class="progress-container" id="progress-${toolName}">
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill-${toolName}"></div>
            </div>
            <div class="progress-text" id="progress-text-${toolName}"></div>
        </div>
    `;
    
    // Add event listeners for compression level
    if (toolName === 'compress') {
        setTimeout(() => {
            document.getElementById('compress-level').addEventListener('change', (e) => {
                const targetSizeGroup = document.getElementById('target-size-group');
                targetSizeGroup.style.display = e.target.value === 'advanced' ? 'block' : 'none';
            });
        }, 100);
    }
}

// ===========================
// FILE HANDLING
// ===========================

const fileStorage = {};

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, toolName) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files);
    processFiles(files, toolName);
}

function handleFileSelect(e, toolName) {
    const files = Array.from(e.target.files);
    processFiles(files, toolName);
}

function processFiles(files, toolName) {
    const config = toolConfigs[toolName];
    const acceptedExts = config.acceptedFormats.split(',').map(ext => ext.trim());
    
    const validFiles = files.filter(file => {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        return acceptedExts.includes(ext);
    });
    
    if (validFiles.length === 0) {
        alert(`Please select valid ${acceptedExts.join(', ')} files`);
        return;
    }
    
    if (!config.multiple) {
        fileStorage[toolName] = [validFiles[0]];
    } else {
        fileStorage[toolName] = fileStorage[toolName] || [];
        fileStorage[toolName].push(...validFiles);
    }
    
    renderFileList(toolName);
    document.getElementById(`action-btn-${toolName}`).disabled = false;
    
    // Load PDF for preview if needed
    if (['delete', 'extract'].includes(toolName) && validFiles[0]) {
        loadPDFPreview(validFiles[0], toolName);
    }
}

function renderFileList(toolName) {
    const files = fileStorage[toolName] || [];
    const container = document.getElementById(`files-container-${toolName}`);
    const listEl = document.getElementById(`file-list-${toolName}`);
    
    if (files.length === 0) {
        listEl.style.display = 'none';
        return;
    }
    
    listEl.style.display = 'block';
    container.innerHTML = files.map((file, index) => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-icon">📄</div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button class="remove-btn" onclick="removeFile('${toolName}', ${index})">✕</button>
        </div>
    `).join('');
}

function removeFile(toolName, index) {
    fileStorage[toolName].splice(index, 1);
    renderFileList(toolName);
    
    if (fileStorage[toolName].length === 0) {
        document.getElementById(`action-btn-${toolName}`).disabled = true;
    }
}

function clearFiles(toolName) {
    fileStorage[toolName] = [];
    renderFileList(toolName);
    document.getElementById(`action-btn-${toolName}`).disabled = true;
    
    // Clear grids
    const deleteGrid = document.getElementById('delete-grid');
    const extractGrid = document.getElementById('extract-grid');
    if (deleteGrid) deleteGrid.innerHTML = '';
    if (extractGrid) extractGrid.innerHTML = '';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ===========================
// PROGRESS BAR
// ===========================

function showProgress(toolName, percent, text) {
    const container = document.getElementById(`progress-${toolName}`);
    const fill = document.getElementById(`progress-fill-${toolName}`);
    const textEl = document.getElementById(`progress-text-${toolName}`);
    
    container.classList.add('active');
    fill.style.width = percent + '%';
    textEl.textContent = text;
}

function hideProgress(toolName) {
    const container = document.getElementById(`progress-${toolName}`);
    container.classList.remove('active');
}

// ===========================
// PDF OPERATIONS - MERGE
// ===========================

async function mergePDFs(toolName) {
    const files = fileStorage[toolName];
    if (!files || files.length === 0) return;
    
    try {
        showProgress(toolName, 10, 'Initializing...');
        
        const mergedPdf = await PDFLib.PDFDocument.create();
        
        for (let i = 0; i < files.length; i++) {
            showProgress(toolName, 10 + (i / files.length) * 70, `Processing ${files[i].name}...`);
            
            const arrayBuffer = await files[i].arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }
        
        showProgress(toolName, 90, 'Finalizing...');
        const mergedPdfBytes = await mergedPdf.save();
        
        showProgress(toolName, 100, 'Complete!');
        downloadFile(mergedPdfBytes, 'merged.pdf', 'application/pdf');
        
        setTimeout(() => hideProgress(toolName), 2000);
    } catch (error) {
        alert('Error merging PDFs: ' + error.message);
        hideProgress(toolName);
    }
}

// ===========================
// PDF OPERATIONS - SPLIT
// ===========================

async function splitPDF(toolName) {
    const files = fileStorage[toolName];
    if (!files || files.length === 0) return;
    
    const rangesInput = document.getElementById('split-ranges').value.trim();
    if (!rangesInput) {
        alert('Please enter page ranges');
        return;
    }
    
    try {
        showProgress(toolName, 10, 'Loading PDF...');
        
        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const totalPages = pdf.getPageCount();
        
        const ranges = parsePageRanges(rangesInput, totalPages);
        
        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            showProgress(toolName, 10 + (i / ranges.length) * 80, `Creating part ${i + 1}/${ranges.length}...`);
            
            const newPdf = await PDFLib.PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdf, range.map(p => p - 1));
            copiedPages.forEach(page => newPdf.addPage(page));
            
            const pdfBytes = await newPdf.save();
            downloadFile(pdfBytes, `split_part_${i + 1}.pdf`, 'application/pdf');
        }
        
        showProgress(toolName, 100, 'Complete!');
        setTimeout(() => hideProgress(toolName), 2000);
    } catch (error) {
        alert('Error splitting PDF: ' + error.message);
        hideProgress(toolName);
    }
}

// ===========================
// PDF OPERATIONS - DELETE
// ===========================

const selectedPagesDelete = new Set();

async function loadPDFPreview(file, toolName) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();
        
        const gridId = toolName === 'delete' ? 'delete-grid' : 'extract-grid';
        const grid = document.getElementById(gridId);
        if (!grid) return;
        
        grid.className = 'page-grid';
        grid.innerHTML = Array.from({ length: pageCount }, (_, i) => `
            <div class="page-item" onclick="togglePage${toolName === 'delete' ? 'Delete' : 'Extract'}(${i + 1})">
                <div class="page-number">Page ${i + 1}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading PDF preview:', error);
    }
}

function togglePageDelete(pageNum) {
    if (selectedPagesDelete.has(pageNum)) {
        selectedPagesDelete.delete(pageNum);
    } else {
        selectedPagesDelete.add(pageNum);
    }
    
    document.querySelectorAll('#delete-grid .page-item').forEach((el, index) => {
        if (selectedPagesDelete.has(index + 1)) {
            el.classList.add('selected');
        } else {
            el.classList.remove('selected');
        }
    });
    
    updateDeleteInput();
}

function updateDeleteInput() {
    const input = document.getElementById('delete-pages');
    if (input && selectedPagesDelete.size > 0) {
        input.value = Array.from(selectedPagesDelete).sort((a, b) => a - b).join(', ');
    }
}

async function deletePagesFromPDF(toolName) {
    const files = fileStorage[toolName];
    if (!files || files.length === 0) return;
    
    const pagesInput = document.getElementById('delete-pages').value.trim();
    if (!pagesInput) {
        alert('Please specify pages to delete');
        return;
    }
    
    try {
        showProgress(toolName, 10, 'Loading PDF...');
        
        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const totalPages = pdf.getPageCount();
        
        const pagesToDelete = parsePageRanges(pagesInput, totalPages).flat();
        const pagesToKeep = Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => !pagesToDelete.includes(p));
        
        showProgress(toolName, 40, 'Removing pages...');
        
        const newPdf = await PDFLib.PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdf, pagesToKeep.map(p => p - 1));
        copiedPages.forEach(page => newPdf.addPage(page));
        
        showProgress(toolName, 80, 'Saving...');
        const pdfBytes = await newPdf.save();
        
        showProgress(toolName, 100, 'Complete!');
        downloadFile(pdfBytes, 'modified.pdf', 'application/pdf');
        
        setTimeout(() => {
            hideProgress(toolName);
            selectedPagesDelete.clear();
        }, 2000);
    } catch (error) {
        alert('Error deleting pages: ' + error.message);
        hideProgress(toolName);
    }
}

// ===========================
// PDF OPERATIONS - EXTRACT
// ===========================

const selectedPagesExtract = new Set();

function togglePageExtract(pageNum) {
    if (selectedPagesExtract.has(pageNum)) {
        selectedPagesExtract.delete(pageNum);
    } else {
        selectedPagesExtract.add(pageNum);
    }
    
    document.querySelectorAll('#extract-grid .page-item').forEach((el, index) => {
        if (selectedPagesExtract.has(index + 1)) {
            el.classList.add('selected');
        } else {
            el.classList.remove('selected');
        }
    });
    
    updateExtractInput();
}

function updateExtractInput() {
    const input = document.getElementById('extract-pages');
    if (input && selectedPagesExtract.size > 0) {
        input.value = Array.from(selectedPagesExtract).sort((a, b) => a - b).join(', ');
    }
}

async function extractPagesFromPDF(toolName) {
    const files = fileStorage[toolName];
    if (!files || files.length === 0) return;
    
    const pagesInput = document.getElementById('extract-pages').value.trim();
    if (!pagesInput) {
        alert('Please specify pages to extract');
        return;
    }
    
    try {
        showProgress(toolName, 10, 'Loading PDF...');
        
        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const totalPages = pdf.getPageCount();
        
        const pagesToExtract = parsePageRanges(pagesInput, totalPages).flat();
        
        showProgress(toolName, 40, 'Extracting pages...');
        
        const newPdf = await PDFLib.PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdf, pagesToExtract.map(p => p - 1));
        copiedPages.forEach(page => newPdf.addPage(page));
        
        showProgress(toolName, 80, 'Saving...');
        const pdfBytes = await newPdf.save();
        
        showProgress(toolName, 100, 'Complete!');
        downloadFile(pdfBytes, 'extracted.pdf', 'application/pdf');
        
        setTimeout(() => {
            hideProgress(toolName);
            selectedPagesExtract.clear();
        }, 2000);
    } catch (error) {
        alert('Error extracting pages: ' + error.message);
        hideProgress(toolName);
    }
}

// ===========================
// PDF OPERATIONS - COMPRESS
// ===========================

async function compressPDF(toolName) {
    const files = fileStorage[toolName];
    if (!files || files.length === 0) return;
    
    const level = document.getElementById('compress-level').value;
    
    if (level === 'advanced') {
        alert('Advanced compression requires running compress_advanced.py in terminal.\n\nUsage:\npython compress_advanced.py input.pdf output.pdf --target-kb 300');
        return;
    }
    
    try {
        showProgress(toolName, 10, 'Loading PDF...');
        
        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        
        showProgress(toolName, 50, 'Compressing...');
        
        const pdfBytes = await pdf.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 50
        });
        
        const originalSize = files[0].size;
        const compressedSize = pdfBytes.length;
        const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
        
        showProgress(toolName, 100, `Complete! Reduced by ${reduction}%`);
        downloadFile(pdfBytes, 'compressed.pdf', 'application/pdf');
        
        setTimeout(() => hideProgress(toolName), 3000);
    } catch (error) {
        alert('Error compressing PDF: ' + error.message);
        hideProgress(toolName);
    }
}

// ===========================
// PDF OPERATIONS - IMAGE TO PDF
// ===========================

async function convertImagesToPDF(toolName) {
    const files = fileStorage[toolName];
    if (!files || files.length === 0) return;
    
    const pageSize = document.getElementById('page-size').value;
    
    try {
        showProgress(toolName, 10, 'Creating PDF...');
        
        const pdfDoc = await PDFLib.PDFDocument.create();
        
        for (let i = 0; i < files.length; i++) {
            showProgress(toolName, 10 + (i / files.length) * 80, `Adding image ${i + 1}/${files.length}...`);
            
            const imageBytes = await files[i].arrayBuffer();
            let image;
            
            if (files[i].type === 'image/png') {
                image = await pdfDoc.embedPng(imageBytes);
            } else {
                image = await pdfDoc.embedJpg(imageBytes);
            }
            
            let pageWidth, pageHeight;
            
            if (pageSize === 'a4') {
                pageWidth = 595.28;
                pageHeight = 841.89;
            } else if (pageSize === 'letter') {
                pageWidth = 612;
                pageHeight = 792;
            } else {
                pageWidth = image.width;
                pageHeight = image.height;
            }
            
            const page = pdfDoc.addPage([pageWidth, pageHeight]);
            
            const imgAspect = image.width / image.height;
            const pageAspect = pageWidth / pageHeight;
            
            let drawWidth, drawHeight, x, y;
            
            if (pageSize === 'fit') {
                drawWidth = pageWidth;
                drawHeight = pageHeight;
                x = 0;
                y = 0;
            } else {
                if (imgAspect > pageAspect) {
                    drawWidth = pageWidth * 0.9;
                    drawHeight = drawWidth / imgAspect;
                } else {
                    drawHeight = pageHeight * 0.9;
                    drawWidth = drawHeight * imgAspect;
                }
                x = (pageWidth - drawWidth) / 2;
                y = (pageHeight - drawHeight) / 2;
            }
            
            page.drawImage(image, {
                x: x,
                y: y,
                width: drawWidth,
                height: drawHeight
            });
        }
        
        showProgress(toolName, 90, 'Finalizing...');
        const pdfBytes = await pdfDoc.save();
        
        showProgress(toolName, 100, 'Complete!');
        downloadFile(pdfBytes, 'images.pdf', 'application/pdf');
        
        setTimeout(() => hideProgress(toolName), 2000);
    } catch (error) {
        alert('Error converting images: ' + error.message);
        hideProgress(toolName);
    }
}

// ===========================
// CONVERSION HELPERS
// ===========================

function showOfficeConversionHelp(toolName) {
    alert('💡 Quick Guide:\n\n1. Open your document in Microsoft Office or LibreOffice\n2. Click File → Save As (or Export)\n3. Choose PDF as the format\n4. Click Save\n\nThis method preserves all formatting and works offline!');
}

function showPDFConversionHelp(toolName) {
    alert('💡 Alternative Solutions:\n\nOnline Services (require internet):\n• iLovePDF.com\n• Smallpdf.com\n• PDF2Go.com\n\nDesktop Software:\n• Adobe Acrobat (commercial)\n• LibreOffice (free, can import some PDFs)\n• Calibre (free ebook converter)\n\nNote: This tool is designed for offline use. PDF to Office conversion requires complex text extraction not available in browsers.');
}

async function convertWordToPDF(toolName) {
    const files = fileStorage[toolName];
    if (!files || files.length === 0) return;
    
    const pageSize = document.getElementById('doc-page-size').value;
    const margins = document.getElementById('doc-margins').value;
    
    // Margin values in mm
    const marginMap = {
        normal: 25.4,   // 1 inch
        narrow: 12.7,   // 0.5 inch
        wide: 38.1      // 1.5 inch
    };
    const margin = marginMap[margins];
    
    try {
        showProgress(toolName, 0, 'Starting conversion...');
        
        // Process each DOCX file
        for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
            const file = files[fileIndex];
            const baseProgress = (fileIndex / files.length) * 100;
            
            showProgress(toolName, baseProgress + 10, `Converting ${file.name}...`);
            
            // Read DOCX file
            const arrayBuffer = await file.arrayBuffer();
            
            showProgress(toolName, baseProgress + 20, 'Extracting content...');
            
            // Convert DOCX to HTML using Mammoth with style preservation
            const result = await mammoth.convertToHtml(
                { arrayBuffer: arrayBuffer },
                {
                    styleMap: [
                        "p[style-name='Heading 1'] => h1:fresh",
                        "p[style-name='Heading 2'] => h2:fresh",
                        "p[style-name='Heading 3'] => h3:fresh",
                        "p[style-name='Title'] => h1.title:fresh",
                        "r[style-name='Strong'] => strong",
                        "r[style-name='Emphasis'] => em",
                    ],
                    includeDefaultStyleMap: true,
                    convertImage: mammoth.images.imgElement(function(image) {
                        return image.read("base64").then(function(imageBuffer) {
                            return {
                                src: "data:" + image.contentType + ";base64," + imageBuffer
                            };
                        });
                    })
                }
            );
            
            showProgress(toolName, baseProgress + 40, 'Formatting document...');
            
            // Create styled HTML container
            const container = document.createElement('div');
            container.style.cssText = `
                position: absolute;
                left: 0;
                top: -20000px;
                width: calc(${pageSize === 'a4' ? '210mm' : '8.5in'} - ${margin * 2}mm);
                padding: 20px;
                background: white;
                font-family: 'Calibri', 'Arial', sans-serif;
                font-size: 11pt;
                line-height: 1.5;
                color: #000000;
            `;
            
            // Enhanced HTML with proper styling
            container.innerHTML = `
                <style>
                    .docx-wrapper p { margin: 0 0 10pt 0; text-align: justify; }
                    .docx-wrapper h1 { font-size: 16pt; font-weight: bold; margin: 12pt 0; }
                    .docx-wrapper h2 { font-size: 14pt; font-weight: bold; margin: 10pt 0; }
                    .docx-wrapper h3 { font-size: 12pt; font-weight: bold; margin: 8pt 0; }
                    .docx-wrapper strong { font-weight: bold; }
                    .docx-wrapper em { font-style: italic; }
                    .docx-wrapper ul, .docx-wrapper ol { margin: 8pt 0; padding-left: 20pt; }
                    .docx-wrapper li { margin: 4pt 0; }
                    .docx-wrapper table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
                    .docx-wrapper td, .docx-wrapper th { border: 1px solid #000; padding: 4pt; }
                    .docx-wrapper img { max-width: 100%; height: auto; }
                    .docx-wrapper a { color: #0000EE; text-decoration: underline; }
                </style>
                <div class="docx-wrapper">${result.value}</div>
            `;
            
            document.body.appendChild(container);
            
            try {
                showProgress(toolName, baseProgress + 60, 'Generating PDF...');
                
                // Convert to PDF using html2pdf with high quality settings
                const opt = {
                    margin: [margin, margin, margin, margin],
                    filename: file.name.replace(/\.docx?$/i, '.pdf'),
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2,
                        useCORS: true,
                        letterRendering: true,
                        logging: false,
                        backgroundColor: '#ffffff'
                    },
                    jsPDF: { 
                        unit: 'mm', 
                        format: pageSize === 'a4' ? 'a4' : 'letter', 
                        orientation: 'portrait',
                        compress: true
                    },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                };
                
                showProgress(toolName, baseProgress + 80, 'Saving PDF...');
                
                await html2pdf().set(opt).from(container).save();
                
            } finally {
                document.body.removeChild(container);
            }
            
            showProgress(toolName, baseProgress + 95, 'Processing complete...');
        }
        
        showProgress(toolName, 100, 'Conversion complete!');
        setTimeout(() => hideProgress(toolName), 2000);
        
    } catch (error) {
        console.error('Conversion error:', error);
        
        let errorMsg = 'Error converting document: ' + error.message;
        
        if (error.message.includes('not defined')) {
            errorMsg += '\n\n🔄 Please refresh the page (Ctrl + F5) to reload the libraries.';
        } else if (error.message.includes('mammoth') || error.message.includes('rendering')) {
            errorMsg += '\n\n💡 Tips:\n• Make sure the file is a valid DOCX (not DOC)\n• Try opening and re-saving the file in Word\n• Large documents may take longer to process';
        }
        
        alert(errorMsg);
        hideProgress(toolName);
    }
}

async function convertPDFToImages(toolName) {
    const files = fileStorage[toolName];
    if (!files || files.length === 0) return;
    
    const format = document.getElementById('image-format').value;
    const quality = document.getElementById('image-quality').value;
    const pagesInput = document.getElementById('pdf-to-image-pages').value.trim();
    
    // Set DPI based on quality
    const dpiMap = { high: 3, medium: 1.5, low: 1 };
    const scale = dpiMap[quality];
    
    try {
        showProgress(toolName, 10, 'Loading PDF...');
        
        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const totalPages = pdf.getPageCount();
        
        // Determine which pages to convert
        let pagesToConvert = [];
        if (pagesInput) {
            const ranges = parsePageRanges(pagesInput, totalPages);
            pagesToConvert = ranges.flat();
        } else {
            pagesToConvert = Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        
        showProgress(toolName, 20, `Converting ${pagesToConvert.length} page(s)...`);
        
        // We need to use PDF.js or canvas to render PDF to image
        // Since we're using pdf-lib which doesn't have rendering, we'll show a helpful message
        alert(`⚠️ PDF to Image Conversion\n\nDirect conversion requires additional libraries not included for offline use.\n\n💡 Alternative Methods:\n\n1. Screenshot Tool:\n   • Open PDF in browser\n   • Use Windows Snipping Tool (Win + Shift + S)\n   • Capture each page\n\n2. Print to Image:\n   • Open PDF in browser\n   • Right-click → Print\n   • Save as PDF, then use screenshot\n\n3. Python Script:\n   • Install: pip install pdf2image\n   • Run: pdf2image.convert_from_path('input.pdf')\n\nFor a browser-based solution, we would need to include PDF.js library (adds ~500KB).`);
        
        hideProgress(toolName);
        
    } catch (error) {
        alert('Error: ' + error.message);
        hideProgress(toolName);
    }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function parsePageRanges(input, maxPages) {
    const ranges = [];
    const parts = input.split(',').map(p => p.trim());
    
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()));
            if (start >= 1 && end <= maxPages && start <= end) {
                const range = [];
                for (let i = start; i <= end; i++) {
                    range.push(i);
                }
                ranges.push(range);
            }
        } else {
            const page = parseInt(part);
            if (page >= 1 && page <= maxPages) {
                ranges.push([page]);
            }
        }
    }
    
    return ranges;
}

function downloadFile(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    showView('home');
});
