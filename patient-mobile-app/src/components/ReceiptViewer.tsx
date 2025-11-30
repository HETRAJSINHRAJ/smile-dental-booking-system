import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Card } from './Card';

interface ReceiptViewerProps {
  receiptUrl: string;
  appointmentId: string;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  receiptUrl,
  appointmentId,
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleViewReceipt = async () => {
    try {
      // Open receipt URL in browser
      const supported = await Linking.canOpenURL(receiptUrl);
      if (supported) {
        await Linking.openURL(receiptUrl);
      } else {
        Alert.alert('Error', 'Cannot open receipt URL');
      }
    } catch (error) {
      console.error('Error opening receipt:', error);
      Alert.alert('Error', 'Failed to open receipt');
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      setDownloading(true);

      // Extract filename from URL or use default
      const filename = `receipt_${appointmentId}.pdf`;
      const downloadPath = `${RNFS.DocumentDirectoryPath}/${filename}`;

      // Download the file
      const downloadResult = await RNFS.downloadFile({
        fromUrl: receiptUrl,
        toFile: downloadPath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        Alert.alert(
          'Success',
          'Receipt downloaded successfully!',
          [
            {
              text: 'Open',
              onPress: () => {
                // Try to open the downloaded file
                Linking.openURL(`file://${downloadPath}`).catch(() => {
                  Alert.alert('Info', 'Receipt saved to app documents folder');
                });
              },
            },
            { text: 'OK' },
          ]
        );
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      Alert.alert('Error', 'Failed to download receipt');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareReceipt = async () => {
    try {
      // Download first, then share
      const filename = `receipt_${appointmentId}.pdf`;
      const downloadPath = `${RNFS.DocumentDirectoryPath}/${filename}`;

      // Check if already downloaded
      const exists = await RNFS.exists(downloadPath);
      
      if (!exists) {
        // Download the file
        const downloadResult = await RNFS.downloadFile({
          fromUrl: receiptUrl,
          toFile: downloadPath,
        }).promise;

        if (downloadResult.statusCode !== 200) {
          throw new Error('Download failed');
        }
      }

      // Share the file
      await Share.open({
        url: `file://${downloadPath}`,
        type: 'application/pdf',
        title: 'Share Receipt',
        subject: 'Appointment Receipt',
      });
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing receipt:', error);
        Alert.alert('Error', 'Failed to share receipt');
      }
    }
  };



  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Icon name="receipt" size={24} color={colors.primary[500]} />
        <Text style={styles.title}>Receipt</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleViewReceipt}
          disabled={downloading}
        >
          <Icon name="eye-outline" size={20} color={colors.primary[500]} />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDownloadReceipt}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={colors.primary[500]} />
          ) : (
            <Icon name="download-outline" size={20} color={colors.primary[500]} />
          )}
          <Text style={styles.actionButtonText}>
            {downloading ? 'Downloading...' : 'Download'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShareReceipt}
          disabled={downloading}
        >
          <Icon name="share-social-outline" size={20} color={colors.primary[500]} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  actionButtonText: {
    ...typography.labelMedium,
    color: colors.primary[500],
    fontWeight: '600',
  },
});
