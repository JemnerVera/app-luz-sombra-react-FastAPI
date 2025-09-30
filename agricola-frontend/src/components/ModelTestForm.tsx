import React, { useState } from 'react';
import { useFieldData } from '../hooks/useFieldData';
import { apiService } from '../services/api';
import { ProcessingResult } from '../types';
import { formatFileSize } from '../utils/helpers';
import { Upload, Eye, Download } from 'lucide-react';

interface ModelTestFormProps {
  onNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const ModelTestForm: React.FC<ModelTestFormProps> = ({ onNotification }) => {
  const { fieldData, loading: fieldLoading } = useFieldData();
  
  const [formData, setFormData] = useState({
    empresa: '',
    fundo: '',
    imagen: null as File | null,
  });
  
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imagen: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = async () => {
    if (!formData.empresa || !formData.fundo || !formData.imagen) {
      onNotification('Por favor completa todos los campos', 'warning');
      return;
    }

    setProcessing(true);
    setResult(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('imagen', formData.imagen);
      formDataToSend.append('empresa', formData.empresa);
      formDataToSend.append('fundo', formData.fundo);

      const result = await apiService.testModel(formDataToSend);
      setResult(result);
      
      if (result.success) {
        onNotification('✅ Imagen procesada exitosamente', 'success');
      } else {
        onNotification('❌ Error al procesar la imagen', 'error');
      }
      
    } catch (error) {
      console.error('Error processing image:', error);
      onNotification('Error al procesar la imagen', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      empresa: '',
      fundo: '',
      imagen: null,
    });
    setImagePreview(null);
    setResult(null);
  };

  if (fieldLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos de campo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Probar Modelo con Visualización</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa *
              </label>
              <select
                value={formData.empresa}
                onChange={(e) => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar empresa...</option>
                {fieldData?.empresa?.map((empresa) => (
                  <option key={empresa} value={empresa}>
                    {empresa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fundo *
              </label>
              <select
                value={formData.fundo}
                onChange={(e) => setFormData(prev => ({ ...prev, fundo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar fundo...</option>
                {fieldData?.fundo?.map((fundo) => (
                  <option key={fundo} value={fundo}>
                    {fundo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="test-image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Subir una imagen</span>
                      <input
                        id="test-image-upload"
                        name="test-image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="pl-1">o arrastra y suelta</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, WebP hasta 10MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Preview */}
          <div>
            {imagePreview && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Vista previa</h3>
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-gray-300"
                  />
                  {formData.imagen && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formData.imagen.name} ({formatFileSize(formData.imagen.size)})
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex space-x-3">
          <button
            onClick={handleProcessImage}
            disabled={processing || !formData.empresa || !formData.fundo || !formData.imagen}
            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Procesar con Visualización
              </>
            )}
          </button>
          
          <button
            onClick={handleClearForm}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultado del Procesamiento</h3>
          
          <div className={`p-4 rounded-lg border ${
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{result.fileName}</h4>
                <p className="text-sm text-gray-600">Fundo: {result.fundo}</p>
                {result.sector && <p className="text-sm text-gray-600">Sector: {result.sector}</p>}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                result.success
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {result.success ? 'Éxito' : 'Error'}
              </div>
            </div>

            {result.success ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded border">
                  <h5 className="font-medium text-gray-900 mb-2">Análisis de Luz</h5>
                  <div className="text-2xl font-bold text-yellow-600">
                    {result.porcentaje_luz}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${result.porcentaje_luz}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border">
                  <h5 className="font-medium text-gray-900 mb-2">Análisis de Sombra</h5>
                  <div className="text-2xl font-bold text-gray-600">
                    {result.porcentaje_sombra}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{ width: `${result.porcentaje_sombra}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-600">
                <p className="font-medium">Error en el procesamiento:</p>
                <p className="text-sm mt-1">{result.error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelTestForm;
