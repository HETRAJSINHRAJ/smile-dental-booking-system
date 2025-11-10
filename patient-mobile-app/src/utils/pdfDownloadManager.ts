import { Platform, PermissionsAndroid, Alert, Share } from 'react-native';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

export interface PDFDownloadOptions {
  htmlContent: string;
  fileName: string;
  title?: string;
  onProgress?: (progress: number) => void;
  onComplete?: (filePath: string) => void;
  onError?: (error: Error) => void;
}

export class PDFDownloadManager {
  private static notificationId = 'pdf-download';
  private static channelId = 'pdf-downloads';

  /**
   * Initialize notification channel (call once on app start)
   */
  static async initialize(): Promise<void> {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: this.channelId,
        name: 'PDF Downloads',
        description: 'Notifications for PDF file downloads',
        importance: AndroidImportance.HIGH,
        vibration: true,
        sound: 'default',
      });

      // Request notification permission for Android 13+
      await notifee.requestPermission();
    }
  }

  /**
   * Request storage permissions for Android
   */
  private static async requestStoragePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const androidVersion = Platform.Version;

      // Android 13+ (API 33+) doesn't need WRITE_EXTERNAL_STORAGE
      if (androidVersion >= 33) {
        return true;
      }

      // Android 10-12 (API 29-32)
      if (androidVersion >= 29) {
        // Scoped storage - no permission needed for app-specific directories
        return true;
      }

      // Android 9 and below (API 28-)
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'This app needs access to save PDF files to your device',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  /**
   * Show download progress notification
   */
  private static async showProgressNotification(
    progress: number,
    fileName: string
  ): Promise<void> {
    await notifee.displayNotification({
      id: this.notificationId,
      title: 'Downloading Receipt',
      body: `${fileName}`,
      android: {
        channelId: this.channelId,
        ongoing: true,
        onlyAlertOnce: true,
        progress: {
          max: 100,
          current: progress,
        },
        smallIcon: 'ic_launcher',
        color: '#22C55E',
      },
    });
  }

  /**
   * Show completion notification with actions
   */
  private static async showCompletionNotification(
    filePath: string,
    fileName: string
  ): Promise<void> {
    await notifee.displayNotification({
      id: this.notificationId,
      title: 'Receipt Downloaded',
      body: `${fileName} is ready`,
      android: {
        channelId: this.channelId,
        smallIcon: 'ic_launcher',
        color: '#22C55E',
        sound: 'default',
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        actions: [
          {
            title: 'Open',
            pressAction: {
              id: 'open-pdf',
            },
          },
          {
            title: 'Share',
            pressAction: {
              id: 'share-pdf',
            },
          },
        ],
        style: {
          type: AndroidStyle.BIGTEXT,
          text: `Tap to open ${fileName} or use the buttons below`,
        },
      },
      data: {
        filePath,
        fileName,
      },
    });
  }

  /**
   * Show error notification
   */
  private static async showErrorNotification(error: string): Promise<void> {
    await notifee.displayNotification({
      id: this.notificationId,
      title: 'Download Failed',
      body: error,
      android: {
        channelId: this.channelId,
        smallIcon: 'ic_launcher',
        color: '#EF4444',
        sound: 'default',
      },
    });
  }

  /**
   * Open PDF file with system default app
   */
  static async openPDF(filePath: string): Promise<void> {
    try {
      // Check if file exists
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        throw new Error('File not found');
      }

      // Use FileViewer to open the PDF - this handles Android file URIs properly
      await FileViewer.open(filePath, {
        showOpenWithDialog: true,
        showAppsSuggestions: true,
      });
    } catch (error: any) {
      console.error('Error opening PDF:', error);
      Alert.alert(
        'Cannot Open File',
        'The file has been downloaded to your Downloads folder. Please install a PDF reader app or use a file manager to open it.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Share PDF file
   */
  static async sharePDF(filePath: string, fileName: string): Promise<void> {
    try {
      // Check if file exists
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        throw new Error('File not found');
      }

      await Share.share(
        {
          url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
          title: fileName,
          message: Platform.OS === 'android' ? `Sharing ${fileName}` : undefined,
        },
        {
          dialogTitle: 'Share PDF',
        }
      );
    } catch (error: any) {
      console.error('Error sharing PDF:', error);
      if (error.message !== 'User did not share') {
        Alert.alert('Share Failed', 'Unable to share the file');
      }
    }
  }

  /**
   * Get appropriate download directory based on platform and Android version
   */
  private static getDownloadDirectory(): string {
    if (Platform.OS === 'ios') {
      return RNFS.DocumentDirectoryPath;
    }

    // For Android, use app's external directory which doesn't require special permissions
    // This is accessible to users via file managers under Android/data/com.patient/files/Downloads
    const appDownloadDir = `${RNFS.ExternalDirectoryPath}/Downloads`;
    return appDownloadDir;
  }

  /**
   * Main download function
   */
  static async downloadPDF(options: PDFDownloadOptions): Promise<string | null> {
    const { htmlContent, fileName, title = 'Receipt', onProgress, onComplete, onError } = options;

    try {
      // Initialize notifications
      await this.initialize();

      // Request permissions
      const hasPermission = await this.requestStoragePermission();
      if (!hasPermission) {
        throw new Error('Storage permission denied');
      }

      // Show initial progress
      await this.showProgressNotification(0, fileName);
      onProgress?.(0);

      // Generate PDF in temp directory first
      const tempFileName = fileName.replace('.pdf', '');
      const pdfOptions = {
        html: htmlContent,
        fileName: tempFileName,
        directory: 'Documents',
        base64: false,
      };

      // Update progress
      await this.showProgressNotification(30, fileName);
      onProgress?.(30);

      const file = await RNHTMLtoPDF.convert(pdfOptions);

      if (!file.filePath) {
        throw new Error('PDF generation failed');
      }

      // Update progress
      await this.showProgressNotification(60, fileName);
      onProgress?.(60);

      // Get final destination path
      const downloadDir = this.getDownloadDirectory();
      const finalPath = `${downloadDir}/${fileName}`;

      console.log('Attempting to save PDF to:', finalPath);

      // Ensure download directory exists
      try {
        const dirExists = await RNFS.exists(downloadDir);
        if (!dirExists) {
          console.log('Creating download directory:', downloadDir);
          await RNFS.mkdir(downloadDir);
        }
      } catch (dirError) {
        console.warn('Could not create/check download directory:', dirError);
      }

      // Check if file exists and delete it
      try {
        const exists = await RNFS.exists(finalPath);
        if (exists) {
          await RNFS.unlink(finalPath);
        }
      } catch (unlinkError) {
        console.warn('Could not check/delete existing file:', unlinkError);
      }

      // Copy to final destination
      try {
        await RNFS.copyFile(file.filePath, finalPath);
        console.log('PDF copied successfully to:', finalPath);
      } catch (copyError: any) {
        console.error('Copy failed, trying move:', copyError);
        // If copy fails, try moving instead
        await RNFS.moveFile(file.filePath, finalPath);
      }

      // Update progress
      await this.showProgressNotification(90, fileName);
      onProgress?.(90);

      // Clean up temp file
      try {
        await RNFS.unlink(file.filePath);
      } catch (cleanupError) {
        console.warn('Temp file cleanup failed:', cleanupError);
      }

      // Complete
      await this.showProgressNotification(100, fileName);
      onProgress?.(100);

      // Show completion notification
      await this.showCompletionNotification(finalPath, fileName);

      // Callback
      onComplete?.(finalPath);

      // Show success alert with file location
      Alert.alert(
        'Download Complete',
        `Receipt has been saved successfully!\n\nLocation: ${fileName}\n\nYou can open it now or find it later in your file manager under:\nAndroid/data/com.patient/files/Downloads`,
        [
          { text: 'OK', style: 'cancel' },
          { 
            text: 'Open', 
            onPress: () => {
              setTimeout(() => this.openPDF(finalPath), 300);
            }
          },
        ]
      );

      return finalPath;
    } catch (error: any) {
      console.error('PDF download error:', error);
      
      await this.showErrorNotification(error.message || 'Failed to download PDF');
      onError?.(error);

      Alert.alert(
        'Download Failed',
        error.message || 'An error occurred while downloading the receipt',
        [{ text: 'OK' }]
      );

      return null;
    }
  }

  /**
   * Cancel ongoing download
   */
  static async cancelDownload(): Promise<void> {
    await notifee.cancelNotification(this.notificationId);
  }
}

/**
 * Setup notification action handlers (call once on app start)
 */
export const setupNotificationHandlers = () => {
  // Handle notification actions
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    if (pressAction?.id === 'open-pdf' && notification?.data?.filePath) {
      await PDFDownloadManager.openPDF(notification.data.filePath as string);
      await notifee.cancelNotification(notification.id!);
    }

    if (pressAction?.id === 'share-pdf' && notification?.data?.filePath) {
      await PDFDownloadManager.sharePDF(
        notification.data.filePath as string,
        notification.data.fileName as string
      );
    }
  });

  // Handle foreground notification actions
  notifee.onForegroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    if (pressAction?.id === 'open-pdf' && notification?.data?.filePath) {
      await PDFDownloadManager.openPDF(notification.data.filePath as string);
      await notifee.cancelNotification(notification.id!);
    }

    if (pressAction?.id === 'share-pdf' && notification?.data?.filePath) {
      await PDFDownloadManager.sharePDF(
        notification.data.filePath as string,
        notification.data.fileName as string
      );
    }
  });
};
