const { initializeDemoData } = require('../app/lib/firebase/demo-data');

async function main() {
  try {
    const { conversationId, demoCreator, demoBrand } = await initializeDemoData();
    console.log('Demo conversation initialized with ID:', conversationId);
    console.log('Demo creator:', demoCreator);
    console.log('Demo brand:', demoBrand);
  } catch (error) {
    console.error('Failed to initialize demo data:', error);
    process.exit(1);
  }
}

main(); 

async function main() {
  try {
    const { conversationId, demoCreator, demoBrand } = await initializeDemoData();
    console.log('Demo conversation initialized with ID:', conversationId);
    console.log('Demo creator:', demoCreator);
    console.log('Demo brand:', demoBrand);
  } catch (error) {
    console.error('Failed to initialize demo data:', error);
    process.exit(1);
  }
}

main(); // review trigger
