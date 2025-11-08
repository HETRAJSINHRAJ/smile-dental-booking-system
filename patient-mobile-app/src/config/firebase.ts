// React Native Firebase is initialized automatically via native configuration files
// (google-services.json for Android and GoogleService-Info.plist for iOS)
// No manual initialization needed

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Export Firebase services
export { auth, firestore, storage };
