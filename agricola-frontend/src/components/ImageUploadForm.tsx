import React, { useState, useCallback } from 'react';
import { useFieldData } from '../hooks/useFieldData';
import { useImageUpload } from '../hooks/useImageUpload';
import { apiService } from '../services/api';
import { ProcessingResult } from '../types';
import { formatFileSize, formatCoordinates } from '../utils/helpers';
import { Upload, X, Eye, Crop, MapPin, AlertCircle } from 'lucide-react';

interface ImageUploadFormProps {
  onUnsavedDataChange: (hasData: boolean) => void;
  onNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const ImageUploadForm: React.FC<ImageUploadFormProps> = ({ onUnsavedDataChange, onNotification }) => {
  const { fieldData, loading: fieldLoading, getFundosByEmpresa, getSectoresByEmpresaAndFundo, getLotesByEmpresaFundoAndSector } = useFieldData();
  const { images, addImages, removeImage, updateImageField, clearImages, hasImages } = useImageUpload();
  
  const [formData, setFormData] = useState({
    empresa: '',
    fundo: '',
    sector: '',
    lote: '',
  });
  
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProcessingResult[]>([]);

  // Track unsaved data
  React.useEffect(() => {
    const hasData = hasImages() || Object.values(formData).some(value => value !== '');
    onUnsavedDataChange(hasData);
  }, [images, formData, hasImages, onUnsavedDataChange]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      addImages(files);
    }
  }, [addImages]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      addImages(files);
    }
  }, [addImages]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset dependent fields when parent changes
      if (field === 'empresa') {
        newData.fundo = '';
        newData.sector = '';
        newData.lote = '';
      } else if (field === 'fundo') {
        newData.sector = '';
        newData.lote = '';
      } else if (field === 'sector') {
        newData.lote = '';
      }
      
      return newData;
    });
  };

  const handleProcessImages = async () => {
    if (!formData.empresa || !formData.fundo) {
      onNotification('Por favor selecciona al menos Empresa y Fundo', 'warning');
      return;
    }

    if (!hasImages()) {
      onNotification('Por favor selecciona al menos una imagen', 'warning');
      return;
    }

    setProcessing(true);
    setResults([]);

    try {
      const promises = images.map(async (imageFile) => {
        const formDataToSend = new FormData();
        formDataToSend.append('imagen', imageFile.file);
        formDataToSend.append('empresa', formData.empresa);
        formDataToSend.append('fundo', formData.fundo);
        formDataToSend.append('sector', formData.sector);
        formDataToSend.append('lote', formData.lote);
        formDataToSend.append('hilera', imageFile.hilera || '');
        formDataToSend.append('numero_planta', imageFile.numero_planta || '');
        
        // Add GPS coordinates if available
        if (imageFile.coordinates) {
          formDataToSend.append('latitud', imageFile.coordinates.lat.toString());
          formDataToSend.append('longitud', imageFile.coordinates.lng.toString());
        }

        return apiService.processImage(formDataToSend);
      });

      const results = await Promise.all(promises);
      setResults(results);
      
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        onNotification(`✅ ${successCount} imagen(es) procesada(s) exitosamente`, 'success');
      }
      
      if (errorCount > 0) {
        onNotification(`❌ ${errorCount} imagen(es) fallaron en el procesamiento`, 'error');
      }
      
    } catch (error) {
      console.error('Error processing images:', error);
      onNotification('Error al procesar las imágenes', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const getGpsStatusDisplay = (imageFile: any) => {
    switch (imageFile.gpsStatus) {
      case 'extracting':
        return <span className="text-gray-400 text-xs">Extrayendo GPS...</span>;
      case 'found':
        return (
          <span className="text-green-600 text-xs flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {formatCoordinates(imageFile.coordinates)}
          </span>
        );
      case 'not-found':
        return (
          <span className="text-red-500 text-xs flex items-center bg-red-50 px-2 py-1 rounded">
            <AlertCircle className="h-3 w-3 mr-1" />
            Sin GPS
          </span>
        );
      default:
        return null;
    }
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
      {/* Form Fields */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del Campo</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa *
            </label>
            <select
              value={formData.empresa}
              onChange={(e) => handleFieldChange('empresa', e.target.value)}
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

          {/* Fundo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fundo *
            </label>
            <select
              value={formData.fundo}
              onChange={(e) => handleFieldChange('fundo', e.target.value)}
              disabled={!formData.empresa}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {formData.empresa ? 'Seleccionar fundo...' : 'Primero selecciona una empresa'}
              </option>
              {formData.empresa && getFundosByEmpresa(formData.empresa).map((fundo) => (
                <option key={fundo} value={fundo}>
                  {fundo}
                </option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sector
            </label>
            <select
              value={formData.sector}
              onChange={(e) => handleFieldChange('sector', e.target.value)}
              disabled={!formData.fundo}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {formData.fundo ? 'Seleccionar sector...' : 'Primero selecciona un fundo'}
              </option>
              {formData.fundo && getSectoresByEmpresaAndFundo(formData.empresa, formData.fundo).map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          {/* Lote */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lote
            </label>
            <select
              value={formData.lote}
              onChange={(e) => handleFieldChange('lote', e.target.value)}
              disabled={!formData.sector}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {formData.sector ? 'Seleccionar lote...' : 'Primero selecciona un sector'}
              </option>
              {formData.sector && getLotesByEmpresaFundoAndSector(formData.empresa, formData.fundo, formData.sector).map((lote) => (
                <option key={lote} value={lote}>
                  {lote}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Imágenes</h2>
        
        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Arrastra imágenes aquí o haz clic para seleccionar
          </p>
          <p className="text-sm text-gray-500 mb-4">
            JPG, PNG, WebP hasta 10MB cada una
          </p>
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Seleccionar Archivos
          </button>
        </div>

        {/* Images List */}
        {images.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-medium text-gray-900">
                Imágenes seleccionadas ({images.length})
              </h3>
              <button
                onClick={clearImages}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Limpiar todas
              </button>
            </div>
            
            {images.map((imageFile, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-center">
                  {/* Image Preview */}
                  <div className="xl:col-span-2">
                    <img
                      src={imageFile.preview}
                      alt={imageFile.file.name}
                      className="w-full h-20 object-cover rounded"
                    />
                  </div>
                  
                  {/* File Info */}
                  <div className="xl:col-span-3">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {imageFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(imageFile.file.size)}
                    </p>
                    {getGpsStatusDisplay(imageFile)}
                  </div>
                  
                  {/* Hilera */}
                  <div className="xl:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Hilera
                    </label>
                    <input
                      type="text"
                      value={imageFile.hilera || ''}
                      onChange={(e) => updateImageField(imageFile.file, 'hilera', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ej: H1"
                    />
                  </div>
                  
                  {/* N° Planta */}
                  <div className="xl:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      N° Planta
                    </label>
                    <input
                      type="text"
                      value={imageFile.numero_planta || ''}
                      onChange={(e) => updateImageField(imageFile.file, 'numero_planta', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ej: P10"
                    />
                  </div>
                  
                  {/* Actions */}
                  <div className="xl:col-span-3 flex space-x-2">
                    <button
                      type="button"
                      className="flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </button>
                    <button
                      type="button"
                      className="flex items-center px-2 py-1 text-xs text-green-600 hover:text-green-800"
                    >
                      <Crop className="h-3 w-3 mr-1" />
                      Recortar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(imageFile.file)}
                      className="flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-800"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Process Button */}
      <div className="bg-white p-6 rounded-lg shadow">
        <button
          onClick={handleProcessImages}
          disabled={processing || !hasImages() || !formData.empresa || !formData.fundo}
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Procesando...
            </>
          ) : (
            `Analizar ${images.length} Imagen${images.length !== 1 ? 'es' : ''}`
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultados</h3>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{result.fileName}</h4>
                    {result.success ? (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Luz: {result.porcentaje_luz}%</p>
                        <p>Sombra: {result.porcentaje_sombra}%</p>
                        {result.hilera && <p>Hilera: {result.hilera}</p>}
                        {result.numero_planta && <p>N° Planta: {result.numero_planta}</p>}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-red-600">{result.error}</p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    result.success
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'Éxito' : 'Error'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadForm;
