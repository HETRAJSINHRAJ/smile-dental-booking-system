import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../contexts/AuthContextWithToast';
import firestore from '@react-native-firebase/firestore';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
];

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const { user, userProfile } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const changeLanguage = async (languageCode: string) => {
    try {
      // Change language in i18n
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);

      // Save to user profile if logged in
      if (user && userProfile) {
        await firestore()
          .collection('users')
          .doc(user.uid)
          .update({
            'preferences.language': languageCode,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
      }

      setModalVisible(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const currentLang = languages.find(l => l.code === currentLanguage);

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        item.code === currentLanguage && styles.selectedLanguageItem,
      ]}
      onPress={() => changeLanguage(item.code)}
    >
      <View style={styles.languageInfo}>
        <Text style={styles.languageName}>{item.nativeName}</Text>
        <Text style={styles.languageSubtitle}>{item.name}</Text>
      </View>
      {item.code === currentLanguage && (
        <Icon name="checkmark-circle" size={24} color={colors.primary[500]} />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.iconContainer}>
          <Icon name="globe-outline" size={24} color={colors.primary[500]} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Language</Text>
          <Text style={styles.subtitle}>{currentLang?.nativeName}</Text>
        </View>
        <Icon name="chevron-forward" size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={languages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              style={styles.languageList}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
    maxHeight: '50%',
    ...shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  languageList: {
    paddingHorizontal: spacing.lg,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  selectedLanguageItem: {
    backgroundColor: colors.primary[50],
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  languageSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});
