// Main JavaScript file for Luz-Sombra application

// Global variables
let currentTab = 'analizar';
let hasUnsavedData = false;
let pendingTab = null;
let historialData = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Luz-Sombra App initialized');
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadFieldData();
    
    // Set initial tab
    setActiveTab('analizar');
});

// Setup all event listeners
function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.id.replace('nav-', '');
            changeTab(tab);
        });
    });
    
    // Form submissions
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleImageUpload);
        uploadForm.addEventListener('change', () => {
            hasUnsavedData = true;
        });
    }
    
    const testForm = document.getElementById('testForm');
    if (testForm) {
        testForm.addEventListener('submit', handleModelTest);
    }
    
    // Action buttons
    const newUploadBtn = document.getElementById('newUploadBtn');
    if (newUploadBtn) {
        newUploadBtn.addEventListener('click', showUploadSection);
    }
    
    const refreshHistorialBtn = document.getElementById('refreshHistorialBtn');
    if (refreshHistorialBtn) {
        refreshHistorialBtn.addEventListener('click', loadHistorial);
    }
    
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportHistorial);
    }
    
    // Modal buttons
    const confirmTabChange = document.getElementById('confirmTabChange');
    if (confirmTabChange) {
        confirmTabChange.addEventListener('click', confirmTabChange);
    }
    
    const cancelTabChange = document.getElementById('cancelTabChange');
    if (cancelTabChange) {
        cancelTabChange.addEventListener('click', cancelTabChange);
    }
    
    // File input drag and drop
    setupFileDragAndDrop();
    
    // Multiple images handling
    setupMultipleImages();
}

// Setup file drag and drop functionality
function setupFileDragAndDrop() {
    const fileInput = document.getElementById('imagenes');
    const uploadSection = document.getElementById('upload-section');
    
    if (!fileInput || !uploadSection) return;
    
    uploadSection.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadSection.classList.add('dragover');
    });
    
    uploadSection.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadSection.classList.remove('dragover');
    });
    
    uploadSection.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadSection.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleMultipleImages(files);
            hasUnsavedData = true;
        }
    });
}

// Setup multiple images functionality
function setupMultipleImages() {
    const fileInput = document.getElementById('imagenes');
    if (!fileInput) return;
    
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            handleMultipleImages(files);
            hasUnsavedData = true;
        }
    });
}

// Handle multiple images selection
function handleMultipleImages(files) {
    const imagenesLista = document.getElementById('imagenes-lista');
    const imagenesContainer = document.getElementById('imagenes-container');
    
    if (!imagenesLista || !imagenesContainer) return;
    
    // Clear previous images
    imagenesContainer.innerHTML = '';
    
    // Show the list
    imagenesLista.classList.remove('hidden');
    
    // Process each file
    files.forEach((file, index) => {
        const imageItem = createImageItem(file, index);
        imagenesContainer.appendChild(imageItem);
    });
}

// Create image item with controls
function createImageItem(file, index) {
    const div = document.createElement('div');
    div.className = 'border border-gray-200 rounded-lg p-4 bg-gray-50';
    div.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
                <div class="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    <img id="preview-${index}" class="w-full h-full object-cover" alt="Preview">
                </div>
                <div>
                    <h5 class="font-medium text-gray-900">${file.name}</h5>
                    <p class="text-sm text-gray-500">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
            </div>
            <button type="button" onclick="removeImage(${index})" class="text-red-600 hover:text-red-800">
                <i data-lucide="x" class="h-5 w-5"></i>
            </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hilera</label>
                <input type="text" name="hilera_${index}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Número de hilera">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">N° Planta</label>
                <input type="text" name="numero_planta_${index}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Número de planta">
            </div>
        </div>
        
        <div class="flex gap-2 mt-3">
            <button type="button" onclick="previewImage(${index})" class="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <i data-lucide="eye" class="h-4 w-4 inline mr-1"></i>
                Ver Imagen
            </button>
            <button type="button" onclick="cropImage(${index})" class="flex-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <i data-lucide="crop" class="h-4 w-4 inline mr-1"></i>
                Recortar
            </button>
        </div>
    `;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById(`preview-${index}`);
        if (preview) {
            preview.src = e.target.result;
        }
    };
    reader.readAsDataURL(file);
    
    return div;
}

// Remove image from list
function removeImage(index) {
    const fileInput = document.getElementById('imagenes');
    const imagenesContainer = document.getElementById('imagenes-container');
    
    if (!fileInput || !imagenesContainer) return;
    
    // Remove from DOM
    const imageItem = document.querySelector(`[onclick="removeImage(${index})"]`)?.closest('.border');
    if (imageItem) {
        imageItem.remove();
    }
    
    // Update file input
    const dt = new DataTransfer();
    const files = Array.from(fileInput.files);
    files.forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });
    fileInput.files = dt.files;
    
    // Hide list if no images
    if (fileInput.files.length === 0) {
        document.getElementById('imagenes-lista').classList.add('hidden');
    }
    
    hasUnsavedData = true;
}

// Preview image in modal
function previewImage(index) {
    const fileInput = document.getElementById('imagenes');
    const file = fileInput.files[index];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        showImageModal(e.target.result, file.name);
    };
    reader.readAsDataURL(file);
}

// Crop image (placeholder function)
function cropImage(index) {
    const fileInput = document.getElementById('imagenes');
    const file = fileInput.files[index];
    
    if (!file) return;
    
    // TODO: Implement crop functionality
    showNotification('Funcionalidad de recorte en desarrollo', 'info');
}

// Show image modal
function showImageModal(imageSrc, fileName) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('imageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Vista previa de imagen</h3>
                    <button onclick="closeImageModal()" class="text-gray-400 hover:text-gray-600">
                        <i data-lucide="x" class="h-6 w-6"></i>
                    </button>
                </div>
                <div class="text-center">
                    <img id="modalImage" class="max-w-full h-auto rounded-lg border border-gray-200" alt="Preview">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Set image
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        modalImage.src = imageSrc;
        modalImage.alt = fileName;
    }
    
    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Close image modal
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Load field data for dropdowns
async function loadFieldData() {
    try {
        console.log('📊 Loading field data...');
        const response = await fetch('/api/google-sheets/field-data');
        const data = await response.json();
        
        if (data.empresa) {
            populateSelect('empresa', data.empresa);
        }
        if (data.fundo) {
            populateSelect('fundo', data.fundo);
        }
        if (data.sector) {
            populateSelect('sector', data.sector);
        }
        if (data.lote) {
            populateSelect('lote', data.lote);
        }
        
        console.log('✅ Field data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading field data:', error);
        showNotification('Error cargando datos de campo', 'error');
    }
}

// Populate select element with options
function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Clear existing options (except first one)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Add new options
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

// Change tab with unsaved data check
function changeTab(tab) {
    if (hasUnsavedData && currentTab === 'analizar') {
        pendingTab = tab;
        showTabChangeModal();
    } else {
        setActiveTab(tab);
    }
}

// Set active tab
function setActiveTab(tab) {
    console.log(`🔄 Switching to tab: ${tab}`);
    
    currentTab = tab;
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(t => {
        t.classList.add('hidden');
    });
    
    // Show active tab
    const activeTabElement = document.getElementById(tab + '-tab');
    if (activeTabElement) {
        activeTabElement.classList.remove('hidden');
    }
    
    // Update navigation
    updateNavigation();
    
    // Load tab-specific data
    if (tab === 'historial') {
        loadHistorial();
    }
    
    hasUnsavedData = false;
}

// Update navigation buttons
function updateNavigation() {
    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('text-gray-700', 'hover:bg-gray-100');
    });
    
    const activeBtn = document.getElementById('nav-' + currentTab);
    if (activeBtn) {
        activeBtn.classList.add('bg-blue-600', 'text-white');
        activeBtn.classList.remove('text-gray-700', 'hover:bg-gray-100');
    }
}

// Show tab change confirmation modal
function showTabChangeModal() {
    const modal = document.getElementById('tabChangeModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

// Confirm tab change
function confirmTabChange() {
    if (pendingTab) {
        setActiveTab(pendingTab);
    }
    hideTabChangeModal();
}

// Cancel tab change
function cancelTabChange() {
    hideTabChangeModal();
}

// Hide tab change modal
function hideTabChangeModal() {
    const modal = document.getElementById('tabChangeModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    pendingTab = null;
}

// Show upload section
function showUploadSection() {
    const uploadSection = document.getElementById('upload-section');
    const resultsSection = document.getElementById('results-section');
    const analysisResults = document.getElementById('analysis-results');
    
    if (uploadSection) uploadSection.classList.remove('hidden');
    if (resultsSection) resultsSection.classList.add('hidden');
    if (analysisResults) analysisResults.innerHTML = '';
    
    hasUnsavedData = false;
}

// Handle image upload
async function handleImageUpload(e) {
    e.preventDefault();
    
    console.log('📸 Processing multiple images upload...');
    
    const formData = new FormData(e.target);
    const submitBtn = document.getElementById('submitBtn');
    const fileInput = document.getElementById('imagenes');
    
    // Validate that images are selected
    if (!fileInput.files || fileInput.files.length === 0) {
        showNotification('Por favor selecciona al menos una imagen', 'warning');
        return;
    }
    
    // Show loading state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="h-5 w-5 animate-spin"></i><span>Analizando...</span>';
    }
    
    try {
        // Process each image individually
        const results = [];
        const files = Array.from(fileInput.files);
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const individualFormData = new FormData();
            
            // Add common fields
            individualFormData.append('empresa', formData.get('empresa'));
            individualFormData.append('fundo', formData.get('fundo'));
            individualFormData.append('sector', formData.get('sector') || '');
            individualFormData.append('lote', formData.get('lote') || '');
            individualFormData.append('latitud', formData.get('latitud') || '');
            individualFormData.append('longitud', formData.get('longitud') || '');
            
            // Add image-specific fields
            individualFormData.append('imagen', file);
            individualFormData.append('hilera', formData.get(`hilera_${i}`) || '');
            individualFormData.append('numero_planta', formData.get(`numero_planta_${i}`) || '');
            
            console.log(`📸 Processing image ${i + 1}/${files.length}: ${file.name}`);
            
            const response = await fetch('/api/procesar-imagen-simple', {
                method: 'POST',
                body: individualFormData
            });
            
            const result = await response.json();
            
            if (result.success) {
                results.push({
                    ...result,
                    fileName: file.name,
                    hilera: formData.get(`hilera_${i}`) || '',
                    numero_planta: formData.get(`numero_planta_${i}`) || ''
                });
                console.log(`✅ Image ${i + 1} processed successfully`);
            } else {
                console.error(`❌ Error processing image ${i + 1}:`, result.detail);
                results.push({
                    success: false,
                    fileName: file.name,
                    error: result.detail || 'Error procesando imagen'
                });
            }
        }
        
        // Show results
        showMultipleAnalysisResults(results);
        hasUnsavedData = false;
        
        const successCount = results.filter(r => r.success).length;
        showNotification(`${successCount}/${files.length} imágenes procesadas exitosamente`, 'success');
        
    } catch (error) {
        console.error('❌ Error processing images:', error);
        showNotification('Error procesando imágenes: ' + error.message, 'error');
    } finally {
        // Restore button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i data-lucide="upload" class="h-5 w-5"></i><span>Analizar Imágenes</span>';
        }
    }
}

// Show analysis result
function showAnalysisResult(result) {
    const resultsHtml = `
        <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Resultado del Análisis</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="text-center">
                    <div class="text-3xl font-bold text-green-600">${result.porcentaje_luz.toFixed(1)}%</div>
                    <div class="text-sm text-gray-500">Luz</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-gray-600">${result.porcentaje_sombra.toFixed(1)}%</div>
                    <div class="text-sm text-gray-500">Sombra</div>
                </div>
            </div>
            <div class="mt-4 text-sm text-gray-600">
                <p><strong>Fundo:</strong> ${result.fundo}</p>
                <p><strong>Sector:</strong> ${result.sector || 'N/A'}</p>
                <p><strong>Hilera:</strong> ${result.hilera || 'N/A'}</p>
                ${result.latitud ? `<p><strong>Coordenadas:</strong> ${result.latitud}, ${result.longitud}</p>` : ''}
            </div>
        </div>
    `;
    
    const analysisResults = document.getElementById('analysis-results');
    const uploadSection = document.getElementById('upload-section');
    const resultsSection = document.getElementById('results-section');
    
    if (analysisResults) analysisResults.innerHTML = resultsHtml;
    if (uploadSection) uploadSection.classList.add('hidden');
    if (resultsSection) resultsSection.classList.remove('hidden');
    
    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Show multiple analysis results
function showMultipleAnalysisResults(results) {
    const successResults = results.filter(r => r.success);
    const errorResults = results.filter(r => !r.success);
    
    let resultsHtml = `
        <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Resultados del Análisis (${results.length} imágenes)</h3>
    `;
    
    // Show success results
    if (successResults.length > 0) {
        resultsHtml += `
            <div class="mb-6">
                <h4 class="text-md font-medium text-green-700 mb-3">✅ Imágenes procesadas exitosamente (${successResults.length})</h4>
                <div class="space-y-4">
        `;
        
        successResults.forEach((result, index) => {
            resultsHtml += `
                <div class="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div class="flex items-center justify-between mb-3">
                        <h5 class="font-medium text-green-900">${result.fileName}</h5>
                        <span class="text-sm text-green-600">Imagen ${index + 1}</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-600">${result.porcentaje_luz.toFixed(1)}%</div>
                            <div class="text-sm text-gray-500">Luz</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-gray-600">${result.porcentaje_sombra.toFixed(1)}%</div>
                            <div class="text-sm text-gray-500">Sombra</div>
                        </div>
                    </div>
                    <div class="mt-3 text-sm text-gray-600">
                        <p><strong>Fundo:</strong> ${result.fundo}</p>
                        <p><strong>Sector:</strong> ${result.sector || 'N/A'}</p>
                        <p><strong>Hilera:</strong> ${result.hilera || 'N/A'}</p>
                        <p><strong>N° Planta:</strong> ${result.numero_planta || 'N/A'}</p>
                        ${result.latitud ? `<p><strong>Coordenadas:</strong> ${result.latitud}, ${result.longitud}</p>` : ''}
                    </div>
                </div>
            `;
        });
        
        resultsHtml += `
                </div>
            </div>
        `;
    }
    
    // Show error results
    if (errorResults.length > 0) {
        resultsHtml += `
            <div class="mb-6">
                <h4 class="text-md font-medium text-red-700 mb-3">❌ Errores en procesamiento (${errorResults.length})</h4>
                <div class="space-y-2">
        `;
        
        errorResults.forEach((result, index) => {
            resultsHtml += `
                <div class="border border-red-200 rounded-lg p-3 bg-red-50">
                    <div class="flex items-center justify-between">
                        <span class="font-medium text-red-900">${result.fileName}</span>
                        <span class="text-sm text-red-600">Error ${index + 1}</span>
                    </div>
                    <p class="text-sm text-red-700 mt-1">${result.error}</p>
                </div>
            `;
        });
        
        resultsHtml += `
                </div>
            </div>
        `;
    }
    
    // Summary
    const avgLuz = successResults.length > 0 ? 
        (successResults.reduce((sum, r) => sum + r.porcentaje_luz, 0) / successResults.length).toFixed(1) : 0;
    const avgSombra = successResults.length > 0 ? 
        (successResults.reduce((sum, r) => sum + r.porcentaje_sombra, 0) / successResults.length).toFixed(1) : 0;
    
    resultsHtml += `
            <div class="border-t border-gray-200 pt-4">
                <h4 class="text-md font-medium text-gray-900 mb-3">📊 Resumen General</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">${avgLuz}%</div>
                        <div class="text-sm text-gray-500">Promedio Luz</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-gray-600">${avgSombra}%</div>
                        <div class="text-sm text-gray-500">Promedio Sombra</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const analysisResults = document.getElementById('analysis-results');
    const uploadSection = document.getElementById('upload-section');
    const resultsSection = document.getElementById('results-section');
    
    if (analysisResults) analysisResults.innerHTML = resultsHtml;
    if (uploadSection) uploadSection.classList.add('hidden');
    if (resultsSection) resultsSection.classList.remove('hidden');
    
    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Handle model test
async function handleModelTest(e) {
    e.preventDefault();
    
    console.log('🧪 Testing model...');
    
    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Show loading state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="h-5 w-5 animate-spin"></i><span>Probando...</span>';
    }
    
    try {
        const response = await fetch('/api/procesar-imagen-visual', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Model test successful:', result);
            showTestResult(result);
            showNotification('Modelo probado exitosamente', 'success');
        } else {
            throw new Error(result.detail || 'Error probando modelo');
        }
    } catch (error) {
        console.error('❌ Error testing model:', error);
        showNotification('Error probando modelo: ' + error.message, 'error');
    } finally {
        // Restore button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i data-lucide="eye" class="h-5 w-5"></i><span>Probar Modelo</span>';
        }
    }
}

// Show test result
function showTestResult(result) {
    const resultsHtml = `
        <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Resultado de la Prueba</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="text-center">
                    <div class="text-3xl font-bold text-green-600">${result.porcentaje_luz.toFixed(1)}%</div>
                    <div class="text-sm text-gray-500">Luz</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-gray-600">${result.porcentaje_sombra.toFixed(1)}%</div>
                    <div class="text-sm text-gray-500">Sombra</div>
                </div>
            </div>
            ${result.imagen_visual ? `
                <div class="mt-6">
                    <h4 class="text-md font-medium text-gray-900 mb-2">Visualización del Análisis</h4>
                    <img src="${result.imagen_visual}" alt="Análisis visual" class="max-w-full h-auto rounded-lg border border-gray-200">
                </div>
            ` : ''}
        </div>
    `;
    
    const testResults = document.getElementById('test-results');
    if (testResults) {
        testResults.innerHTML = resultsHtml;
        testResults.classList.remove('hidden');
    }
    
    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Load historial
async function loadHistorial() {
    console.log('📊 Loading historial...');
    
    const refreshBtn = document.getElementById('refreshHistorialBtn');
    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<i data-lucide="loader-2" class="h-4 w-4 animate-spin"></i><span>Cargando...</span>';
    }
    
    try {
        const response = await fetch('/api/historial');
        const data = await response.json();
        
        if (data.success) {
            historialData = data.procesamientos;
            displayHistorial(historialData);
            
            const exportBtn = document.getElementById('exportCsvBtn');
            if (exportBtn) {
                exportBtn.classList.remove('hidden');
            }
            
            console.log(`✅ Historial loaded: ${historialData.length} records`);
        } else {
            throw new Error(data.detail || 'Error cargando historial');
        }
    } catch (error) {
        console.error('❌ Error loading historial:', error);
        showNotification('Error cargando el historial', 'error');
    } finally {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<i data-lucide="refresh-cw" class="h-4 w-4"></i><span>Actualizar Historial</span>';
        }
    }
}

// Display historial
function displayHistorial(data) {
    const historialContent = document.getElementById('historial-content');
    if (!historialContent) return;
    
    if (data.length === 0) {
        historialContent.innerHTML = `
            <div class="text-center py-12">
                <i data-lucide="bar-chart-3" class="h-12 w-12 text-gray-400 mx-auto mb-4"></i>
                <h3 class="text-lg font-medium text-gray-500 mb-2">No hay procesamientos guardados</h3>
                <p class="text-gray-400">Sube y analiza imágenes para ver el historial aquí</p>
            </div>
        `;
    } else {
        const tableHtml = `
            <div class="overflow-x-auto">
                <table class="w-full text-xs">
                    <thead>
                        <tr class="border-b">
                            <th class="text-left py-2 px-2 font-medium w-12">ID</th>
                            <th class="text-left py-2 px-2 font-medium w-20">Empresa</th>
                            <th class="text-left py-2 px-2 font-medium w-24">Fundo</th>
                            <th class="text-left py-2 px-2 font-medium w-16">Sector</th>
                            <th class="text-left py-2 px-2 font-medium w-16">Lote</th>
                            <th class="text-left py-2 px-2 font-medium w-12">Hilera</th>
                            <th class="text-left py-2 px-2 font-medium w-16">N° Planta</th>
                            <th class="text-right py-2 px-2 font-medium w-16">Luz (%)</th>
                            <th class="text-right py-2 px-2 font-medium w-16">Sombra (%)</th>
                            <th class="text-left py-2 px-2 font-medium w-20">Latitud</th>
                            <th class="text-left py-2 px-2 font-medium w-20">Longitud</th>
                            <th class="text-left py-2 px-2 font-medium w-28">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => `
                            <tr class="border-b hover:bg-gray-50 transition-colors">
                                <td class="py-2 px-2 font-mono text-xs">${item.id}</td>
                                <td class="py-2 px-2 font-medium text-xs truncate max-w-20" title="${item.empresa || 'N/A'}">
                                    ${item.empresa || 'N/A'}
                                </td>
                                <td class="py-2 px-2 font-medium text-xs truncate max-w-24" title="${item.fundo}">
                                    ${item.fundo}
                                </td>
                                <td class="py-2 px-2 font-medium text-xs truncate max-w-16" title="${item.sector || 'N/A'}">
                                    ${item.sector || 'N/A'}
                                </td>
                                <td class="py-2 px-2 font-medium text-xs truncate max-w-16" title="${item.lote || 'N/A'}">
                                    ${item.lote || 'N/A'}
                                </td>
                                <td class="py-2 px-2 font-medium text-xs text-center">
                                    ${item.hilera || 'N/A'}
                                </td>
                                <td class="py-2 px-2 font-medium text-xs text-center">
                                    ${item.numero_planta || 'N/A'}
                                </td>
                                <td class="py-2 px-2 text-right font-medium text-xs text-green-600">
                                    ${item.porcentaje_luz.toFixed(1)}%
                                </td>
                                <td class="py-2 px-2 text-right font-medium text-xs text-gray-600">
                                    ${item.porcentaje_sombra.toFixed(1)}%
                                </td>
                                <td class="py-2 px-2 text-gray-500 text-xs">
                                    ${item.latitud ? item.latitud.toFixed(4) : 'N/A'}
                                </td>
                                <td class="py-2 px-2 text-gray-500 text-xs">
                                    ${item.longitud ? item.longitud.toFixed(4) : 'N/A'}
                                </td>
                                <td class="py-2 px-2 text-gray-500 text-xs">
                                    ${new Date(item.timestamp).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        historialContent.innerHTML = tableHtml;
    }
    
    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Export historial to CSV
function exportHistorial() {
    if (historialData.length === 0) {
        showNotification('No hay datos para exportar', 'warning');
        return;
    }
    
    console.log('📊 Exporting historial to CSV...');
    
    const csvContent = [
        ['ID', 'Empresa', 'Fundo', 'Sector', 'Lote', 'Hilera', 'N° Planta', 'Luz (%)', 'Sombra (%)', 'Fecha Tomada', 'Latitud', 'Longitud', 'Fecha Procesamiento'].join(','),
        ...historialData.map(item => [
            item.id,
            `"${item.empresa || ''}"`,
            `"${item.fundo}"`,
            `"${item.sector || ''}"`,
            `"${item.lote || ''}"`,
            `"${item.hilera || ''}"`,
            `"${item.numero_planta || ''}"`,
            item.porcentaje_luz.toFixed(2),
            item.porcentaje_sombra.toFixed(2),
            item.fecha_tomada ? `"${new Date(item.fecha_tomada).toLocaleString()}"` : '""',
            item.latitud || '',
            item.longitud || '',
            `"${new Date(item.timestamp).toLocaleString()}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_luz_sombra_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Historial exportado exitosamente', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
    
    // Set colors based on type
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                <i data-lucide="x" class="h-4 w-4"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
    
    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatNumber(number, decimals = 2) {
    return parseFloat(number).toFixed(decimals);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('❌ Global error:', e.error);
    showNotification('Ha ocurrido un error inesperado', 'error');
});

// Export functions for global access
window.changeTab = changeTab;
window.showUploadSection = showUploadSection;
window.loadHistorial = loadHistorial;
window.exportHistorial = exportHistorial;
window.confirmTabChange = confirmTabChange;
window.cancelTabChange = cancelTabChange;
