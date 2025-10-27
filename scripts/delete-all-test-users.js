/**
 * Quick script to delete all test users
 * Run with: node scripts/delete-all-test-users.js
 */

const admin = require('firebase-admin');

// Initialize with environment variable or default credentials
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

async function deleteAllUsers() {
  console.log('🗑️  Deleting all documents in users collection...\n');
  
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  if (snapshot.empty) {
    console.log('✅ No documents to delete. Collection is already empty.');
    return;
  }

  console.log(`Found ${snapshot.size} documents to delete\n`);
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.forEach((doc) => {
    console.log(`  Deleting: ${doc.id}`);
    batch.delete(doc.ref);
    count++;
  });
  
  await batch.commit();
  
  console.log(`\n✅ Successfully deleted ${count} documents!`);
}

deleteAllUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

