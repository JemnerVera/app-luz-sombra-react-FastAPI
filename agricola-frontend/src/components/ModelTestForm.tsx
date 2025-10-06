import React, { useState } from 'react';
import { ProcessingResult } from '../types';
import { formatFileSize } from '../utils/helpers';
import { Upload, Eye, Brain, Loader } from 'lucide-react';
import { useTensorFlow } from '../hooks/useTensorFlow';

interface ModelTestFormProps {
  onNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const ModelTestForm: React.FC<ModelTestFormProps> = ({ onNotification }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const [useTensorFlowJS, setUseTensorFlowJS] = useState(true);
  
  // TensorFlow hook
  const {
    isInitialized,
    isModelReady,
    isProcessing: tfProcessing,
    error: tfError,
    processImage: tfProcessImage
  } = useTensorFlow();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      // Reset previous results
      setResult(null);
      setProcessedImageUrl('');
    }
  };

  const handleProcessImage = async () => {
    if (!selectedFile) {
      onNotification('Por favor selecciona una imagen', 'warning');
      return;
    }

    setProcessing(true);
    setResult(null);
    setProcessedImageUrl('');

    try {
      if (useTensorFlowJS && isModelReady) {
        // Use TensorFlow.js for processing
        console.log('🧠 Processing with TensorFlow.js...');
        const tfResult = await tfProcessImage(selectedFile);
        
        // Convert TensorFlow result to ProcessingResult format
        const processingResult: ProcessingResult = {
          success: true,
          porcentaje_luz: tfResult.lightPercentage,
          porcentaje_sombra: tfResult.shadowPercentage,
          image_name: `tf_${selectedFile.name}_${Date.now()}.png`,
          processed_image: tfResult.processedImageData
        };
        
        setResult(processingResult);
        setProcessedImageUrl(tfResult.processedImageData);
        onNotification('Imagen procesada con TensorFlow.js!', 'success');
        
      } else {
        // TensorFlow.js no está listo
        onNotification('TensorFlow.js no está listo. Espera a que se inicialice completamente.', 'warning');
        return;
      }
    } catch (error: any) {
      console.error('Error processing image:', error);
      onNotification(error.message || 'Error al procesar la imagen', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-dark-800 rounded-xl shadow-2xl border border-gray-200 dark:border-dark-700 animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 font-display">Probar Modelo</h2>
      <p className="text-gray-600 dark:text-dark-300 mb-6">
        Sube una imagen para probar el modelo de Machine Learning y ver las áreas de luz y sombra identificadas.
      </p>

      {/* TensorFlow Status */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            TensorFlow.js Status
          </h3>
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useTensorFlowJS}
                onChange={(e) => setUseTensorFlowJS(e.target.checked)}
                className="mr-2"
                disabled={!isModelReady}
              />
              <span className="text-sm text-gray-600 dark:text-dark-300">Usar TensorFlow.js</span>
            </label>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <span className="w-24 text-gray-600 dark:text-dark-300">Inicializado:</span>
            <span className={`px-2 py-1 rounded text-xs ${isInitialized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isInitialized ? '✅ Sí' : '❌ No'}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <span className="w-24 text-gray-600 dark:text-dark-300">Modelo:</span>
            <span className={`px-2 py-1 rounded text-xs ${isModelReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {isModelReady ? '✅ Listo' : tfProcessing ? '🔄 Entrenando...' : '⏳ Cargando...'}
            </span>
          </div>
          
          {tfError && (
            <div className="text-sm text-red-600 dark:text-red-400">
              Error: {tfError}
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
            Seleccionar Imagen
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-xl p-6 text-center hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-dark-700 transition-all duration-200">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Upload className="h-4 w-4 mr-2" />
              Seleccionar Imagen
            </label>
            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-dark-300">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Original Preview */}
        {preview && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Imagen Original</h3>
            <div className="border rounded-lg p-4">
              <img
                src={preview}
                alt="Original Preview"
                className="max-w-full h-auto max-h-96 mx-auto"
              />
            </div>
          </div>
        )}

        {/* Process Button */}
        <div className="flex justify-center">
          <button
            onClick={handleProcessImage}
            disabled={!selectedFile || processing}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white transition-all duration-200 ${
              !selectedFile || processing || (useTensorFlowJS && !isModelReady)
                ? 'bg-dark-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {processing ? (
              <Loader className="h-5 w-5 mr-3 animate-spin" />
            ) : (
              useTensorFlowJS ? <Brain className="h-5 w-5 mr-3" /> : <Eye className="h-5 w-5 mr-3" />
            )}
            {processing ? 
              (useTensorFlowJS ? 'Procesando con TensorFlow.js...' : 'Procesando...') : 
              (useTensorFlowJS ? 'Procesar con TensorFlow.js' : 'Procesar Imagen')
            }
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-700 border border-accent-500 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 font-display">Resultado del Análisis:</h3>
            {result.success ? (
              <div className="text-accent-600 dark:text-accent-300">
                <p className="text-sm font-mono bg-white dark:bg-dark-800 p-3 rounded-lg border border-gray-200 dark:border-dark-600 text-gray-900 dark:text-white">
                  {result.image_name ? result.image_name.split('.')[0] : 'imagen'} |
                  Luz: {result.porcentaje_luz?.toFixed(2)}% |
                  Sombra: {result.porcentaje_sombra?.toFixed(2)}%
                </p>
              </div>
            ) : (
              <p className="text-red-600 dark:text-red-400">{result.error}</p>
            )}
          </div>
        )}

        {/* Processed Image */}
        {processedImageUrl && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Imagen Procesada (con áreas identificadas)</h3>
            <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4 bg-white dark:bg-dark-800">
              <img
                src={processedImageUrl}
                alt="Resultado del análisis"
                className="max-w-full h-auto max-h-96 mx-auto"
                onError={() => {
                  setProcessedImageUrl('');
                  onNotification('No se pudo cargar la imagen procesada', 'warning');
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelTestForm;