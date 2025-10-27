/**
 * Script to delete all documents in the users collection
 * ⚠️ WARNING: This will permanently delete all user documents!
 * Use with caution - only for test/development purposes
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin with your service account
// Make sure you have GOOGLE_APPLICATION_CREDENTIALS env var set
// or provide the path to your service account key
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = admin.firestore();

async function deleteCollection(collectionPath, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    console.log(`  Deleting document: ${doc.id}`);
    batch.delete(doc.ref);
  });
  await batch.commit();

  console.log(`  Deleted ${batchSize} documents`);

  // Recurse on the next process tick, to avoid exploding the stack
  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

async function confirmAndDelete() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will delete ALL documents in the "users" collection!\n' +
      '   This action cannot be undone.\n\n' +
      '   Type "DELETE ALL USERS" to confirm: ',
      (answer) => {
        rl.close();
        if (answer === 'DELETE ALL USERS') {
          resolve(true);
        } else {
          console.log('\n❌ Deletion cancelled.');
          resolve(false);
        }
      }
    );
  });
}

async function main() {
  console.log('🔥 Firebase User Collection Deletion Tool\n');
  
  const confirmed = await confirmAndDelete();
  
  if (!confirmed) {
    process.exit(0);
  }

  console.log('\n🗑️  Starting deletion...\n');

  try {
    await deleteCollection('users', 100);
    console.log('\n✅ Successfully deleted all documents in the users collection!');
  } catch (error) {
    console.error('\n❌ Error deleting collection:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();

