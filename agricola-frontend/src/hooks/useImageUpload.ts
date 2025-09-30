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
      }
      
      // Add all images first
      setImages(prev => [...prev, ...newImages]);
      
      // Then extract GPS for each image
      for (const imageFile of newImages) {
        extractGpsFromImage(imageFile.file)
          .then((coordinates: GpsCoordinates | null) => {
            console.log(`🔍 GPS extraction for ${imageFile.file.name}:`, coordinates ? 'Found' : 'Not found');
            setImages(prev => prev.map(img => 
              img.file === imageFile.file 
                ? {
                    ...img,
                    gpsStatus: coordinates ? 'found' : 'not-found',
                    coordinates: coordinates || undefined
                  }
                : img
            ));
          })
          .catch((error) => {
            console.error(`❌ Error extracting GPS for ${imageFile.file.name}:`, error);
            setImages(prev => prev.map(img => 
              img.file === imageFile.file 
                ? { ...img, gpsStatus: 'not-found', coordinates: undefined }
                : img
            ));
          });
      }
    } catch (error) {
      console.error('Error adding images:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeImage = useCallback((file: File) => {
    setImages(prev => prev.filter(img => img.file !== file));
    
    // Clear GPS cache for removed image
    const cacheKey = `${file.name}_${file.size}_${file.lastModified}`;
    if (typeof window !== 'undefined' && (window as any).gpsCache) {
      (window as any).gpsCache.delete(cacheKey);
    }
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
