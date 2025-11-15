import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNotifications } from '../../hooks/useNotifications';
import { PushNotification } from '../../types/notification';
import { format } from 'date-fns';

export const NotificationsScreen: React.FC = () => {
  const { notifications, loading, fetchNotifications, markAsRead, clearAll } = useNotifications();

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
        return <Icon name="checkmark-circle" size={24} color="#10B981" />;
      case 'appointment_reminder':
        return <Icon name="time" size={24} color="#F59E0B" />;
      case 'appointment_cancelled':
        return <Icon name="close-circle" size={24} color="#EF4444" />;
      case 'payment_success':
        return <Icon name="card" size={24} color="#10B981" />;
      case 'payment_failed':
        return <Icon name="alert-circle" size={24} color="#EF4444" />;
      default:
        return <Icon name="notifications" size={24} color="#6366F1" />;
    }
  };

  const renderItem = ({ item }: { item: PushNotification }) => {
    const date = item.createdAt?.toDate?.() || new Date();
    
    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unread]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={styles.iconContainer}>
          {renderNotificationIcon(item.type)}
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.time}>
            {format(date, 'MMM dd, yyyy • hh:mm a')}
          </Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="notifications-off-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchNotifications}
              colors={['#6366F1']}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  clearButton: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unread: {
    backgroundColor: '#EEF2FF',
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    marginLeft: 8,
    alignSelf: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
});
