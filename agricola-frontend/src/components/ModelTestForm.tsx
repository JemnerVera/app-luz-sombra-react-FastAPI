import React, { useState } from 'react';
import { apiService } from '../services/api';
import { ProcessingResult } from '../types';
import { formatFileSize } from '../utils/helpers';
import { Upload, Eye } from 'lucide-react';

interface ModelTestFormProps {
  onNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const ModelTestForm: React.FC<ModelTestFormProps> = ({ onNotification }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');

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
      const formData = new FormData();
      formData.append('imagen', selectedFile);
      // No need for field data in test mode
      formData.append('empresa', 'TEST');
      formData.append('fundo', 'TEST');
      formData.append('sector', 'TEST');
      formData.append('lote', 'TEST');
      formData.append('hilera', 'TEST');
      formData.append('numero_planta', 'TEST');

      const result = await apiService.testModel(formData);
      setResult(result);
      
      if (result.success && result.image_name) {
        // Construct the processed image URL
        const processedUrl = `http://localhost:8000/resultados/${result.image_name}`;
        setProcessedImageUrl(processedUrl);
        onNotification('Imagen procesada exitosamente!', 'success');
      } else {
        onNotification(result.error || 'Error al procesar la imagen', 'error');
      }
    } catch (error: any) {
      console.error('Error processing image:', error);
      onNotification(error.response?.data?.detail || 'Error al procesar la imagen', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-dark-800 rounded-xl shadow-2xl border border-dark-700 animate-fade-in">
      <h2 className="text-2xl font-semibold text-white mb-6 font-display">Probar Modelo</h2>
      <p className="text-dark-300 mb-6">
        Sube una imagen para probar el modelo de Machine Learning y ver las áreas de luz y sombra identificadas.
      </p>
      
      <div className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            Seleccionar Imagen
          </label>
          <div className="border-2 border-dashed border-dark-600 rounded-xl p-6 text-center hover:border-primary-400 hover:bg-dark-700 transition-all duration-200">
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
              !selectedFile || processing
                ? 'bg-dark-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {processing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            ) : (
              <Eye className="h-5 w-5 mr-3" />
            )}
            {processing ? 'Procesando...' : 'Procesar Imagen'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-6 p-4 bg-dark-700 border border-accent-500 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-3 font-display">Resultado del Análisis:</h3>
            {result.success ? (
              <div className="text-accent-300">
                <p className="text-sm font-mono bg-dark-800 p-3 rounded-lg border border-dark-600 text-white">
                  {result.image_name ? result.image_name.split('.')[0] : 'imagen'} | 
                  Luz: {result.porcentaje_luz?.toFixed(2)}% | 
                  Sombra: {result.porcentaje_sombra?.toFixed(2)}%
                </p>
              </div>
            ) : (
              <p className="text-red-400">{result.error}</p>
            )}
          </div>
        )}

        {/* Processed Image */}
        {processedImageUrl && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Imagen Procesada (con áreas identificadas)</h3>
            <div className="border rounded-lg p-4">
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