import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';

export interface ImageResult {
  uri: string;
  type: 'image';
  name: string;
  size?: number;
}

export class CameraService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      return cameraPermission.status === 'granted' && libraryPermission.status === 'granted';
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  static async takePicture(): Promise<ImageResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permissões de câmera necessárias');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          type: 'image',
          name: `photo_${Date.now()}.jpg`,
          size: asset.fileSize,
        };
      }

      return null;
    } catch (error) {
      console.error('Camera error:', error);
      throw error;
    }
  }

  static async pickFromLibrary(): Promise<ImageResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permissões de galeria necessárias');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          type: 'image',
          name: `image_${Date.now()}.jpg`,
          size: asset.fileSize,
        };
      }

      return null;
    } catch (error) {
      console.error('Image picker error:', error);
      throw error;
    }
  }

  static async showImagePicker(): Promise<ImageResult | null> {
    return new Promise((resolve) => {
      // This would typically show an ActionSheet or Modal
      // For now, we'll default to library picker
      this.pickFromLibrary().then(resolve).catch(() => resolve(null));
    });
  }
}

// Venue/Event image capture utilities
export class VenueImageCapture {
  static async captureVenueImages(): Promise<ImageResult[]> {
    const images: ImageResult[] = [];
    
    try {
      // Allow multiple image capture for venue listings
      const image = await CameraService.showImagePicker();
      if (image) {
        images.push(image);
      }
      
      return images;
    } catch (error) {
      console.error('Venue image capture error:', error);
      return [];
    }
  }

  static async captureProfileImage(): Promise<ImageResult | null> {
    try {
      return await CameraService.showImagePicker();
    } catch (error) {
      console.error('Profile image capture error:', error);
      return null;
    }
  }
}

// AR Preview utilities for venue visualization
export class ARPreviewService {
  static async isARSupported(): Promise<boolean> {
    // Check device AR capabilities
    // This would integrate with ARCore/ARKit
    return true; // Placeholder for AR support check
  }

  static async launchVenueAR(venueId: number): Promise<void> {
    try {
      const supported = await this.isARSupported();
      if (!supported) {
        throw new Error('AR não suportado neste dispositivo');
      }

      // Launch AR preview for venue layout
      console.log(`Launching AR preview for venue ${venueId}`);
      // This would open AR camera with venue 3D model overlay
    } catch (error) {
      console.error('AR launch error:', error);
      throw error;
    }
  }
}