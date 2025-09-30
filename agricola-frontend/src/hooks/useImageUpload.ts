import { useState, useCallback } from 'react';
import { ImageFile } from '../types';
import { extractGpsFromImage, GpsCoordinates } from '../utils/exif';
import { createImagePreview, validateImageFile } from '../utils/helpers';

export const useImageUpload = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);

  const addImages = useCallback(async (files: FileList | File[]) => {
    setLoading(true);
    
    try {
      const fileArray = Array.from(files);
      const newImages: ImageFile[] = [];
      
      for (const file of fileArray) {
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
          console.warn(`❌ Invalid file ${file.name}: ${validation.error}`);
          continue;
        }
        
        // Create preview
        const preview = await createImagePreview(file);
        
        // Create image object
        const imageFile: ImageFile = {
          file,
          preview,
          gpsStatus: 'extracting',
          hilera: '',
          numero_planta: '',
        };
        
        newImages.push(imageFile);
        
        // Extract GPS in background
        extractGpsFromImage(file)
          .then((coordinates: GpsCoordinates | null) => {
            setImages(prev => prev.map(img => 
              img.file === file 
                ? {
                    ...img,
                    gpsStatus: coordinates ? 'found' : 'not-found',
                    coordinates: coordinates || undefined
                  }
                : img
            ));
          })
          .catch((error) => {
            console.error('Error extracting GPS:', error);
            setImages(prev => prev.map(img => 
              img.file === file 
                ? { ...img, gpsStatus: 'not-found', coordinates: undefined }
                : img
            ));
          });
      }
      
      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Error adding images:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeImage = useCallback((file: File) => {
    setImages(prev => prev.filter(img => img.file !== file));
  }, []);

  const updateImageField = useCallback((file: File, field: 'hilera' | 'numero_planta', value: string) => {
    setImages(prev => prev.map(img => 
      img.file === file 
        ? { ...img, [field]: value }
        : img
    ));
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  const getImageCount = useCallback(() => {
    return images.length;
  }, [images]);

  const hasImages = useCallback(() => {
    return images.length > 0;
  }, [images]);

  const getValidImages = useCallback(() => {
    return images.filter(img => img.file);
  }, [images]);

  return {
    images,
    loading,
    addImages,
    removeImage,
    updateImageField,
    clearImages,
    getImageCount,
    hasImages,
    getValidImages,
  };
};
