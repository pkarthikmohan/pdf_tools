// ===========================
// VIEW NAVIGATION & MOBILE
// ===========================

function showView(viewName) {
    const views = document.querySelectorAll('.view-container');
    views.forEach(view => view.classList.remove('active'));
    
    const target = document.getElementById(viewName + '-view');
    if (target) target.classList.add('active');
    
    // Update navbar desktop & mobile
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.textContent.toLowerCase().includes(viewName) || 
            (viewName === 'home' && link.textContent === 'Home')) {
            link.classList.add('active');
        }
    });

    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showTool(toolName) {
    showView('tool');
    renderToolWorkspace(toolName);
    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('mobile-menu-btn');
    if (!menu || !btn) return;
    
    const isOpen = menu.classList.contains('active');
    if (isOpen) {
        closeMobileMenu();
    } else {
        menu.classList.add('active');
        btn.classList.add('active');
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('mobile-menu-btn');
    if (menu) menu.classList.remove('active');
    if (btn) btn.classList.remove('active');
}

function mobileNavigateHome() {
    showView('home');
}

function mobileNavigateTool(toolName) {
    showTool(toolName);
}

function filterCategory(category, buttonEl) {
    document.querySelectorAll('.filter-chip').forEach(btn => btn.classList.remove('active'));
    if (buttonEl) buttonEl.classList.add('active');
    
    const categories = document.querySelectorAll('.tool-category');
    if (category === 'all') {
        categories.forEach(cat => cat.style.display = 'block');
    } else {
        categories.forEach(cat => {
            const catType = cat.getAttribute('data-category');
            if (catType === category) {
                cat.style.display = 'block';
            } else {
                cat.style.display = 'none';
            }
        });
        const targetSection = document.getElementById(`cat-${category}`);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

// ===========================
// TOOL WORKSPACE RENDERER
// ===========================

const toolConfigs = {
    merge: {
        title: 'Merge PDF',
        description: 'Combine multiple PDF files into one document',
        multiple: true,
        acceptedFormats: '.pdf',
        options: ``,
        actionText: 'Merge PDFs',
        handler: mergePDFs
    },
    split: {
        title: 'Split PDF',
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
                <div class="option-hint">Specify page ranges separated by commas or click pages below</div>
            </div>
            <div id="split-grid"></div>
        `,
        actionText: 'Split PDF',
        handler: splitPDF
    },
    delete: {
        title: 'Remove Pages',
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
        title: 'Extract Pages',
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
        title: 'Compress PDF',
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
        title: 'Image to PDF',
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
        title: 'Word to PDF',
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
                    <strong>High-Quality Conversion:</strong> Preserves fonts, styles, tables, and layout. Text remains selectable.
                </p>
            </div>
        `,
        actionText: 'Convert to PDF',
        handler: convertWordToPDF
    },
    'excel-to-pdf': {
        title: 'Excel to PDF',
        description: 'Convert XLSX spreadsheets to PDF format',
        multiple: false,
        acceptedFormats: '.xlsx',
        options: `
            <div class="option-group" style="background: #FFF3CD; padding: 1rem; border-radius: 8px; border-left: 4px solid #F0B90B;">
                <p style="margin: 0; color: #856404;">
                    <strong>Browser Limitation:</strong> Excel to PDF conversion requires complex spreadsheet rendering not available in browsers.
                    <br><br>
                    <strong>Recommended method:</strong> Open your XLSX file in Excel/LibreOffice Calc &rarr; File &rarr; Save As &rarr; PDF
                </p>
            </div>
        `,
        actionText: 'Learn How to Convert',
        handler: showOfficeConversionHelp
    },
    'ppt-to-pdf': {
        title: 'PowerPoint to PDF',
        description: 'Convert PPTX presentations to PDF format',
        multiple: false,
        acceptedFormats: '.ppt,.pptx',
        options: `
            <div class="option-group" style="background: #FFF3CD; padding: 1rem; border-radius: 8px; border-left: 4px solid #F0B90B;">
                <p style="margin: 0; color: #856404;">
                    <strong>Browser Limitation:</strong> Direct PowerPoint to PDF conversion requires Microsoft Office or LibreOffice installed on your system.
                    <br><br>
                    <strong>Recommended method:</strong> Open your PPTX file in PowerPoint/LibreOffice Impress &rarr; File &rarr; Save As &rarr; PDF
                </p>
            </div>
        `,
        actionText: 'Learn How to Convert',
        handler: showOfficeConversionHelp
    },
    'pdf-to-word': {
        title: 'PDF to Word',
        description: 'Convert PDF to editable DOCX document',
        multiple: false,
        acceptedFormats: '.pdf',
        options: `
            <div class="option-group" style="background: #FFF3CD; padding: 1rem; border-radius: 8px; border-left: 4px solid #F0B90B;">
                <p style="margin: 0; color: #856404;">
                    <strong>Feature Notice:</strong> Offline PDF to editable Word conversion requires desktop word processor rendering.
                    <br><br>
                    <strong>Suggested alternatives:</strong>
                    <br>&bull; Use Adobe Acrobat or Microsoft Word (Open &gt; PDF)
                    <br>&bull; Use online conversion services
                    <br>&bull; Open with LibreOffice Draw/Writer
                </p>
            </div>
        `,
        actionText: 'View Alternatives',
        handler: showPDFConversionHelp
    },
    'pdf-to-excel': {
        title: 'PDF to Excel',
        description: 'Extract tables from PDF to XLSX format',
        multiple: false,
        acceptedFormats: '.pdf',
        options: `
            <div class="option-group" style="background: #FFF3CD; padding: 1rem; border-radius: 8px; border-left: 4px solid #F0B90B;">
                <p style="margin: 0; color: #856404;">
                    <strong>Feature Notice:</strong> PDF to Excel conversion requires automated table detection algorithms.
                    <br><br>
                    <strong>Suggested alternatives:</strong>
                    <br>&bull; Use Tabula (free desktop data extractor)
                    <br>&bull; Open in Microsoft Excel (Data &gt; Get Data &gt; From File &gt; From PDF)
                    <br>&bull; Use Adobe Acrobat
                </p>
            </div>
        `,
        actionText: 'View Alternatives',
        handler: showPDFConversionHelp
    },
    'pdf-to-ppt': {
        title: 'PDF to PowerPoint',
        description: 'Convert PDF pages to PPTX slides',
        multiple: false,
        acceptedFormats: '.pdf',
        options: `
            <div class="option-group" style="background: #FFF3CD; padding: 1rem; border-radius: 8px; border-left: 4px solid #F0B90B;">
                <p style="margin: 0; color: #856404;">
                    <strong>Feature Notice:</strong> Offline PDF to presentation conversion requires desktop office suites.
                    <br><br>
                    <strong>Suggested alternatives:</strong>
                    <br>&bull; Use Adobe Acrobat (Export to PPTX)
                    <br>&bull; Convert PDF to Images, then insert slides into PowerPoint
                    <br>&bull; Open in LibreOffice Impress
                </p>
            </div>
        `,
        actionText: 'View Alternatives',
        handler: showPDFConversionHelp
    },
    'pdf-to-image': {
        title: 'PDF to Image',
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
            <div class="upload-icon">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
            </div>
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
    if (['delete', 'extract', 'split'].includes(toolName) && validFiles[0]) {
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
                <div class="file-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                </div>
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
        clearFiles(toolName);
    }
}

function clearFiles(toolName) {
    fileStorage[toolName] = [];
    renderFileList(toolName);
    document.getElementById(`action-btn-${toolName}`).disabled = true;
    
    // Clear grids and selections
    ['delete', 'extract', 'split'].forEach(t => {
        const grid = document.getElementById(`${t}-grid`);
        if (grid) grid.innerHTML = '';
    });
    if (typeof selectedPagesDelete !== 'undefined') selectedPagesDelete.clear();
    if (typeof selectedPagesExtract !== 'undefined') selectedPagesExtract.clear();
    if (typeof selectedPagesSplit !== 'undefined') selectedPagesSplit.clear();
    
    const delInput = document.getElementById('delete-pages');
    if (delInput) delInput.value = '';
    const extInput = document.getElementById('extract-pages');
    if (extInput) extInput.value = '';
    const splitInput = document.getElementById('split-ranges');
    if (splitInput) splitInput.value = '';
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
// PDF OPERATIONS - PREVIEW & SELECTION
// ===========================

// Configure PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const selectedPagesDelete = new Set();
const selectedPagesExtract = new Set();
const selectedPagesSplit = new Set();

async function loadPDFPreview(file, toolName) {
    const gridId = `${toolName}-grid`;
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    // Clear previous selection for this tool
    if (toolName === 'delete') selectedPagesDelete.clear();
    else if (toolName === 'extract') selectedPagesExtract.clear();
    else if (toolName === 'split') selectedPagesSplit.clear();

    grid.className = 'page-grid';
    grid.innerHTML = `
        <div class="preview-loading">
            <div class="preview-spinner"></div>
            <p>Rendering high-resolution page thumbnails...</p>
        </div>
    `;

    try {
        const arrayBuffer = await file.arrayBuffer();
        
        if (typeof pdfjsLib !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        let pageCount = 0;
        let pdfDoc = null;

        if (typeof pdfjsLib !== 'undefined') {
            const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) });
            pdfDoc = await loadingTask.promise;
            pageCount = pdfDoc.numPages;
        } else {
            const pdfLibDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            pageCount = pdfLibDoc.getPageCount();
        }

        grid.innerHTML = '';

        // Toolbar with quick actions
        const toolbar = document.createElement('div');
        toolbar.className = 'preview-toolbar';
        toolbar.innerHTML = `
            <div class="toolbar-left">
                <span class="preview-total-pages">${pageCount} ${pageCount === 1 ? 'Page' : 'Pages'}</span>
                <span class="preview-hint">Click pages to toggle selection</span>
            </div>
            <div class="toolbar-actions">
                <button type="button" class="preview-tool-btn" onclick="selectAllPages('${toolName}', ${pageCount})">Select All</button>
                <button type="button" class="preview-tool-btn" onclick="clearSelectedPages('${toolName}')">Deselect All</button>
            </div>
        `;
        grid.appendChild(toolbar);

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'page-items-container';
        grid.appendChild(itemsContainer);

        // Build page cards with skeleton loader
        for (let i = 1; i <= pageCount; i++) {
            const pageItem = document.createElement('div');
            pageItem.className = 'page-item';
            pageItem.id = `${toolName}-page-${i}`;
            pageItem.onclick = () => togglePageSelection(toolName, i);
            pageItem.innerHTML = `
                <div class="page-canvas-wrapper" id="${toolName}-wrapper-${i}">
                    <div class="page-skeleton">Page ${i}</div>
                </div>
                <div class="page-number">Page ${i}</div>
            `;
            itemsContainer.appendChild(pageItem);
        }

        // Render thumbnails via PDF.js
        if (pdfDoc) {
            renderPagesThumbnails(pdfDoc, toolName, pageCount);
        }
    } catch (error) {
        console.error('Error loading PDF preview:', error);
        grid.innerHTML = `
            <div style="padding: 1.5rem; text-align: center; color: var(--text-gray); background: #FFF3CD; border-radius: 8px;">
                Could not generate page thumbnails: ${error.message}
            </div>
        `;
    }
}

async function renderPagesThumbnails(pdfDoc, toolName, pageCount) {
    for (let i = 1; i <= pageCount; i++) {
        const wrapper = document.getElementById(`${toolName}-wrapper-${i}`);
        if (!wrapper) break;
        
        try {
            const page = await pdfDoc.getPage(i);
            const unscaledViewport = page.getViewport({ scale: 1.0 });
            
            // 240px wide thumbnail for clear readability of page content
            const targetWidth = 240;
            const scale = targetWidth / unscaledViewport.width;
            const viewport = page.getViewport({ scale: scale });
            
            const canvas = document.createElement('canvas');
            canvas.className = 'page-canvas';
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            
            if (wrapper.parentNode) {
                wrapper.innerHTML = '';
                wrapper.appendChild(canvas);
            }
        } catch (e) {
            console.warn(`Error rendering thumbnail for page ${i}:`, e);
        }
    }
}

function togglePageSelection(toolName, pageNum) {
    let set;
    if (toolName === 'delete') set = selectedPagesDelete;
    else if (toolName === 'extract') set = selectedPagesExtract;
    else if (toolName === 'split') set = selectedPagesSplit;
    if (!set) return;

    if (set.has(pageNum)) {
        set.delete(pageNum);
    } else {
        set.add(pageNum);
    }

    const pageItem = document.getElementById(`${toolName}-page-${pageNum}`);
    if (pageItem) {
        pageItem.classList.toggle('selected', set.has(pageNum));
    }

    syncSelectionToInput(toolName);
}

function selectAllPages(toolName, pageCount) {
    let set;
    if (toolName === 'delete') set = selectedPagesDelete;
    else if (toolName === 'extract') set = selectedPagesExtract;
    else if (toolName === 'split') set = selectedPagesSplit;
    if (!set) return;

    set.clear();
    for (let i = 1; i <= pageCount; i++) {
        set.add(i);
    }
    document.querySelectorAll(`#${toolName}-grid .page-item`).forEach(el => el.classList.add('selected'));
    syncSelectionToInput(toolName);
}

function clearSelectedPages(toolName) {
    let set;
    if (toolName === 'delete') set = selectedPagesDelete;
    else if (toolName === 'extract') set = selectedPagesExtract;
    else if (toolName === 'split') set = selectedPagesSplit;
    if (!set) return;

    set.clear();
    document.querySelectorAll(`#${toolName}-grid .page-item`).forEach(el => el.classList.remove('selected'));
    syncSelectionToInput(toolName);
}

function syncSelectionToInput(toolName) {
    let set, inputId;
    if (toolName === 'delete') { set = selectedPagesDelete; inputId = 'delete-pages'; }
    else if (toolName === 'extract') { set = selectedPagesExtract; inputId = 'extract-pages'; }
    else if (toolName === 'split') { set = selectedPagesSplit; inputId = 'split-ranges'; }
    
    const input = document.getElementById(inputId);
    if (!input || !set) return;

    if (set.size === 0) {
        input.value = '';
        return;
    }

    const sorted = Array.from(set).sort((a, b) => a - b);
    const ranges = [];
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === prev + 1) {
            prev = sorted[i];
        } else {
            ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
            start = sorted[i];
            prev = sorted[i];
        }
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);

    input.value = ranges.join(', ');
}

function onManualPageInput(toolName) {
    let set, inputId;
    if (toolName === 'delete') { set = selectedPagesDelete; inputId = 'delete-pages'; }
    else if (toolName === 'extract') { set = selectedPagesExtract; inputId = 'extract-pages'; }
    else if (toolName === 'split') { set = selectedPagesSplit; inputId = 'split-ranges'; }
    
    const input = document.getElementById(inputId);
    if (!input || !set) return;

    const totalPages = document.querySelectorAll(`#${toolName}-grid .page-item`).length;
    if (totalPages === 0) return;

    const parsed = parsePageRanges(input.value, totalPages).flat();
    set.clear();
    parsed.forEach(p => set.add(p));

    document.querySelectorAll(`#${toolName}-grid .page-item`).forEach((el, index) => {
        el.classList.toggle('selected', set.has(index + 1));
    });
}

// Backward compatibility helpers
function togglePageDelete(pageNum) { togglePageSelection('delete', pageNum); }
function togglePageExtract(pageNum) { togglePageSelection('extract', pageNum); }
function updateDeleteInput() { syncSelectionToInput('delete'); }
function updateExtractInput() { syncSelectionToInput('extract'); }

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
    alert('Quick Guide:\n\n1. Open your document in Microsoft Office or LibreOffice\n2. Click File → Save As (or Export)\n3. Choose PDF as the format\n4. Click Save\n\nThis method preserves all formatting and works offline!');
}

function showPDFConversionHelp(toolName) {
    alert('Alternative Solutions:\n\nOnline Services (require internet):\n• iLovePDF.com\n• Smallpdf.com\n• PDF2Go.com\n\nDesktop Software:\n• Adobe Acrobat (commercial)\n• LibreOffice (free, can import some PDFs)\n• Calibre (free ebook converter)\n\nNote: This tool is designed for offline use. PDF to Office conversion requires complex text extraction not available in browsers.');
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
            errorMsg += '\n\nPlease refresh the page (Ctrl + F5) to reload the libraries.';
        } else if (error.message.includes('mammoth') || error.message.includes('rendering')) {
            errorMsg += '\n\nTips:\n• Make sure the file is a valid DOCX (not DOC)\n• Try opening and re-saving the file in Word\n• Large documents may take longer to process';
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
        
        if (typeof pdfjsLib === 'undefined') {
            alert('PDF.js library is loading. Please try again in a moment.');
            hideProgress(toolName);
            return;
        }

        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdfDoc = await loadingTask.promise;
        
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const extension = format === 'png' ? 'png' : 'jpg';

        for (let i = 0; i < pagesToConvert.length; i++) {
            const pageNum = pagesToConvert[i];
            const pct = 20 + Math.round(((i + 1) / pagesToConvert.length) * 75);
            showProgress(toolName, pct, `Rendering page ${pageNum} (${i + 1}/${pagesToConvert.length})...`);

            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            if (format === 'jpg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            await page.render({ canvasContext: ctx, viewport: viewport }).promise;

            await new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    const baseName = files[0].name.replace(/\.[^/.]+$/, '');
                    downloadFile(blob, `${baseName}_page_${pageNum}.${extension}`, mimeType);
                    resolve();
                }, mimeType, 0.92);
            });
        }

        showProgress(toolName, 100, 'Images downloaded!');
        setTimeout(() => hideProgress(toolName), 2000);
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
// PWA INSTALLATION & SERVICE WORKER
// ===========================

let deferredPWAEvent = null;

// Register Service Worker for offline capability & PWA install prompt
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => {
                console.log('PDF Tools Service Worker active:', reg.scope);
            })
            .catch(err => {
                console.warn('Service Worker registration skipped:', err);
            });
    });
}

function isStandaloneApp() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true || 
           document.referrer.includes('android-app://');
}

// Capture beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPWAEvent = e;

    const navBtn = document.getElementById('install-btn-nav');
    if (navBtn) navBtn.style.display = 'inline-flex';

    const banner = document.getElementById('pwa-install-banner');
    const dismissed = localStorage.getItem('pdf_tools_pwa_dismissed');
    if (banner && !dismissed && !isStandaloneApp()) {
        setTimeout(() => {
            banner.classList.add('show');
        }, 1500);
    }
});

window.addEventListener('appinstalled', () => {
    deferredPWAEvent = null;
    hidePWAPrompts();
    showToastNotification('PDF Tools has been installed successfully!');
});

async function triggerPWAInstall() {
    if (deferredPWAEvent) {
        deferredPWAEvent.prompt();
        const choice = await deferredPWAEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
            console.log('User accepted PWA installation');
        }
        deferredPWAEvent = null;
        hidePWAPrompts();
        return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        showIOSInstallModal();
        return;
    }

    if (isStandaloneApp()) {
        alert('PDF Tools is already installed and running on your device.');
    } else {
        alert('To install PDF Tools:\n\n• On Chrome / Edge (Desktop): Click the Install icon in the address bar (top-right)\n• On Android / Chrome: Tap Menu (three dots) -> "Install App" or "Add to Home Screen"');
    }
}

function dismissPWABanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.classList.remove('show');
    localStorage.setItem('pdf_tools_pwa_dismissed', 'true');
}

function hidePWAPrompts() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.classList.remove('show');
    const navBtn = document.getElementById('install-btn-nav');
    if (navBtn && isStandaloneApp()) navBtn.style.display = 'none';
}

function showIOSInstallModal() {
    const modal = document.getElementById('pwa-ios-modal');
    if (modal) modal.style.display = 'flex';
}

function closeIOSModal() {
    const modal = document.getElementById('pwa-ios-modal');
    if (modal) modal.style.display = 'none';
}

function showToastNotification(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    showView('home');
    if (isStandaloneApp()) {
        const navBtn = document.getElementById('install-btn-nav');
        if (navBtn) navBtn.style.display = 'none';
    }
});
