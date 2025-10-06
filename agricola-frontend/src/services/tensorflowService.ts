import * as tf from '@tensorflow/tfjs';

export interface PixelClassificationResult {
  lightPercentage: number;
  shadowPercentage: number;
  processedImageData: string; // Base64 encoded image
  classificationMap: number[][];
}

export class TensorFlowService {
  private model: tf.LayersModel | null = null;
  private isModelLoaded = false;

  /**
   * Initialize TensorFlow.js
   */
  async initialize(): Promise<void> {
    try {
      // Set backend to CPU for better compatibility
      await tf.setBackend('cpu');
      await tf.ready();
      console.log('✅ TensorFlow.js initialized');
    } catch (error) {
      console.error('❌ Error initializing TensorFlow.js:', error);
      throw error;
    }
  }

  /**
   * Create and train a simple model for pixel classification
   */
  async createModel(): Promise<void> {
    try {
      // Create a simple sequential model
      this.model = tf.sequential({
        layers: [
          // Input layer - RGB values (3 features)
          tf.layers.dense({
            inputShape: [3],
            units: 64,
            activation: 'relu',
            name: 'dense1'
          }),
          tf.layers.dropout({ rate: 0.2 }),
          
          // Hidden layer
          tf.layers.dense({
            units: 32,
            activation: 'relu',
            name: 'dense2'
          }),
          tf.layers.dropout({ rate: 0.2 }),
          
          // Output layer - 4 classes (SUELO_SOMBRA, SUELO_LUZ, MALLA_SOMBRA, MALLA_LUZ)
          tf.layers.dense({
            units: 4,
            activation: 'softmax',
            name: 'output'
          })
        ]
      });

      // Compile the model
      this.model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      console.log('✅ TensorFlow model created');
      this.isModelLoaded = true;
    } catch (error) {
      console.error('❌ Error creating model:', error);
      throw error;
    }
  }

  /**
   * Train the model with synthetic data based on real dataset analysis
   */
  async trainModel(): Promise<void> {
    if (!this.model) {
      throw new Error('Model not created');
    }

    try {
      // Generate training data based on real dataset analysis
      const { features, labels } = this.generateTrainingData();
      
      // Convert to tensors
      const xs = tf.tensor2d(features);
      const ys = tf.tensor2d(labels);

      // Train the model
      const history = await this.model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 1
      });

      console.log('✅ Model trained successfully');
      
      // Clean up tensors
      xs.dispose();
      ys.dispose();
    } catch (error) {
      console.error('❌ Error training model:', error);
      throw error;
    }
  }

  /**
   * Generate training data based on real dataset analysis
   */
  private generateTrainingData(): { features: number[][], labels: number[][] } {
    const features: number[][] = [];
    const labels: number[][] = [];
    
    // Generate 10000 samples based on real dataset statistics
    for (let i = 0; i < 10000; i++) {
      const r = Math.random() * 255;
      const g = Math.random() * 255;
      const b = Math.random() * 255;
      
      const intensity = (r + g + b) / 3;
      const greenRatio = g / (r + b + 1);
      
      // Classify based on real dataset thresholds
      let classIndex: number;
      
      if (intensity < 101.0 && greenRatio <= 0.53) {
        classIndex = 0; // SUELO_SOMBRA
      } else if (intensity >= 101.0 && greenRatio <= 0.53) {
        classIndex = 1; // SUELO_LUZ
      } else if (intensity < 135.4 && greenRatio > 0.52) {
        classIndex = 2; // MALLA_SOMBRA
      } else {
        classIndex = 3; // MALLA_LUZ
      }
      
      features.push([r, g, b]);
      
      // One-hot encoding
      const label = [0, 0, 0, 0];
      label[classIndex] = 1;
      labels.push(label);
    }
    
    return { features, labels };
  }

  /**
   * Classify pixels in an image
   */
  async classifyImagePixels(imageData: ImageData): Promise<PixelClassificationResult> {
    if (!this.model || !this.isModelLoaded) {
      throw new Error('Model not loaded');
    }

    try {
      const { data, width, height } = imageData;
      const pixels: number[][] = [];
      
      // Extract RGB values from image data
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        pixels.push([r, g, b]);
      }

      // Convert to tensor
      const pixelTensor = tf.tensor2d(pixels);
      
      // Predict
      const predictions = this.model.predict(pixelTensor) as tf.Tensor;
      const predictionArray = await predictions.data();
      
      // Process results
      const classificationMap: number[][] = [];
      let lightPixels = 0;
      let shadowPixels = 0;
      
      for (let i = 0; i < pixels.length; i++) {
        const pixelIndex = i * 4;
        const classIndex = this.getMaxIndex(predictionArray.slice(pixelIndex, pixelIndex + 4));
        
        // Map to 2D array
        const x = i % width;
        const y = Math.floor(i / width);
        if (!classificationMap[y]) classificationMap[y] = [];
        classificationMap[y][x] = classIndex;
        
        // Count light and shadow pixels
        if (classIndex === 1 || classIndex === 3) { // SUELO_LUZ or MALLA_LUZ
          lightPixels++;
        } else if (classIndex === 0 || classIndex === 2) { // SUELO_SOMBRA or MALLA_SOMBRA
          shadowPixels++;
        }
      }
      
      // Calculate percentages
      const totalPixels = pixels.length;
      const lightPercentage = (lightPixels / totalPixels) * 100;
      const shadowPercentage = (shadowPixels / totalPixels) * 100;
      
      // Create processed image
      const processedImageData = this.createProcessedImage(imageData, classificationMap);
      
      // Clean up tensors
      pixelTensor.dispose();
      predictions.dispose();
      
      return {
        lightPercentage,
        shadowPercentage,
        processedImageData,
        classificationMap
      };
      
    } catch (error) {
      console.error('❌ Error classifying pixels:', error);
      throw error;
    }
  }

  /**
   * Get the index of the maximum value in an array
   */
  private getMaxIndex(arr: Float32Array | number[]): number {
    let maxIndex = 0;
    let maxValue = arr[0];
    
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > maxValue) {
        maxValue = arr[i];
        maxIndex = i;
      }
    }
    
    return maxIndex;
  }

  /**
   * Create a processed image with color-coded classifications
   */
  private createProcessedImage(imageData: ImageData, classificationMap: number[][]): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    
    const processedData = ctx.createImageData(imageData.width, imageData.height);
    
    // Color mapping
    const colors = [
      [128, 128, 128, 255], // SUELO_SOMBRA - Gray
      [255, 255, 0, 255],   // SUELO_LUZ - Yellow
      [0, 128, 0, 255],     // MALLA_SOMBRA - Dark Green
      [0, 255, 0, 255]      // MALLA_LUZ - Green
    ];
    
    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const classIndex = classificationMap[y][x];
        const color = colors[classIndex];
        
        const pixelIndex = (y * imageData.width + x) * 4;
        processedData.data[pixelIndex] = color[0];     // R
        processedData.data[pixelIndex + 1] = color[1]; // G
        processedData.data[pixelIndex + 2] = color[2]; // B
        processedData.data[pixelIndex + 3] = color[3]; // A
      }
    }
    
    ctx.putImageData(processedData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  /**
   * Check if model is loaded and ready
   */
  isReady(): boolean {
    return this.isModelLoaded && this.model !== null;
  }

  /**
   * Dispose of the model to free memory
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isModelLoaded = false;
    }
  }
}

// Export singleton instance
export const tensorFlowService = new TensorFlowService();
