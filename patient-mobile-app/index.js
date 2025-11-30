/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { markAppStart } from './src/lib/performanceMonitoring';

// Mark app start time as early as possible for performance tracking
markAppStart();

// Register background handler for FCM
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  
  // Display notification using Notifee
  if (remoteMessage.notification) {
    await notifee.displayNotification({
      title: remoteMessage.notification.title,
      body: remoteMessage.notification.body,
      android: {
        channelId: 'default',
        importance: 4,
        pressAction: {
          id: 'default',
        },
      },
      data: remoteMessage.data,
    });
  }
});

AppRegistry.registerComponent(appName, () => App);
