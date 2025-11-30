// Quick test to verify Firebase Realtime Database authentication
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./smile-dental-booking-demo-firebase-adminsdk-zzqxe-e0e0e0e0e0.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://smile-dental-booking-demo-default-rtdb.firebaseio.com'
});

const db = admin.database();

async function testDatabaseAccess() {
  try {
    console.log('Testing database access...');
    
    // Try to read conversations
    const conversationsRef = db.ref('conversations');
    const snapshot = await conversationsRef.once('value');
    
    console.log('✅ Successfully read conversations');
    console.log('Data exists:', snapshot.exists());
    console.log('Number of conversations:', snapshot.numChildren());
    
    // Try to write a test conversation
    const testConvRef = conversationsRef.push();
    await testConvRef.set({
      id: testConvRef.key,
      patientId: 'test-patient-123',
      patientName: 'Test Patient',
      patientEmail: 'test@example.com',
      status: 'active',
      unreadCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    console.log('✅ Successfully created test conversation');
    console.log('Conversation ID:', testConvRef.key);
    
    // Clean up
    await testConvRef.remove();
    console.log('✅ Cleaned up test conversation');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDatabaseAccess();
