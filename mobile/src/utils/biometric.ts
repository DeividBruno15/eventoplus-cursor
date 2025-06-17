import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export interface BiometricCapabilities {
  isAvailable: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  hasHardware: boolean;
  isEnrolled: boolean;
}

export class BiometricService {
  private static readonly BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
  private static readonly BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

  static async getCapabilities(): Promise<BiometricCapabilities> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const isAvailable = hasHardware && isEnrolled;

      return {
        isAvailable,
        supportedTypes,
        hasHardware,
        isEnrolled,
      };
    } catch (error) {
      console.error('Biometric capabilities check error:', error);
      return {
        isAvailable: false,
        supportedTypes: [],
        hasHardware: false,
        isEnrolled: false,
      };
    }
  }

  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(this.BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Biometric status check error:', error);
      return false;
    }
  }

  static async enableBiometric(credentials: { email: string; password: string }): Promise<boolean> {
    try {
      const capabilities = await this.getCapabilities();
      
      if (!capabilities.isAvailable) {
        throw new Error('Autenticação biométrica não disponível');
      }

      // Test biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirme sua identidade para ativar autenticação biométrica',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar senha',
      });

      if (!result.success) {
        throw new Error('Falha na autenticação biométrica');
      }

      // Store credentials securely
      await SecureStore.setItemAsync(
        this.BIOMETRIC_CREDENTIALS_KEY,
        JSON.stringify(credentials)
      );
      await SecureStore.setItemAsync(this.BIOMETRIC_ENABLED_KEY, 'true');

      return true;
    } catch (error) {
      console.error('Biometric enable error:', error);
      throw error;
    }
  }

  static async disableBiometric(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.BIOMETRIC_CREDENTIALS_KEY);
      await SecureStore.deleteItemAsync(this.BIOMETRIC_ENABLED_KEY);
    } catch (error) {
      console.error('Biometric disable error:', error);
      throw error;
    }
  }

  static async authenticateWithBiometric(): Promise<{ email: string; password: string } | null> {
    try {
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) {
        return null;
      }

      const capabilities = await this.getCapabilities();
      if (!capabilities.isAvailable) {
        // Disable biometric if no longer available
        await this.disableBiometric();
        return null;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Use sua biometria para entrar',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar senha',
      });

      if (!result.success) {
        return null;
      }

      // Retrieve stored credentials
      const credentialsJson = await SecureStore.getItemAsync(this.BIOMETRIC_CREDENTIALS_KEY);
      if (!credentialsJson) {
        // Credentials not found, disable biometric
        await this.disableBiometric();
        return null;
      }

      return JSON.parse(credentialsJson);
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return null;
    }
  }

  static getBiometricTypeDescription(types: LocalAuthentication.AuthenticationType[]): string {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID / Impressão Digital';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Íris';
    }
    return 'Autenticação Biométrica';
  }
}

// Enhanced profile screen with biometric settings
export class BiometricProfileIntegration {
  static async setupBiometricToggle(
    currentCredentials: { email: string; password: string },
    onStatusChange: (enabled: boolean) => void
  ): Promise<void> {
    try {
      const capabilities = await BiometricService.getCapabilities();
      const isEnabled = await BiometricService.isBiometricEnabled();

      if (!capabilities.isAvailable) {
        onStatusChange(false);
        return;
      }

      if (isEnabled) {
        // Biometric is enabled, user can disable it
        await BiometricService.disableBiometric();
        onStatusChange(false);
      } else {
        // Enable biometric
        await BiometricService.enableBiometric(currentCredentials);
        onStatusChange(true);
      }
    } catch (error) {
      console.error('Biometric toggle error:', error);
      throw error;
    }
  }
}