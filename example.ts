import { PanindiganClient, AppState } from './src';
import fs from 'fs';
import path from 'path';

async function main() {
  // Check for environment variable first
  if (process.env.FB_APPSTATE) {
    console.log('Using FB_APPSTATE from environment variables.');
  } else {
    // Fallback to local file
    const appStatePath = path.join(__dirname, 'appstate.json');
    if (fs.existsSync(appStatePath)) {
        console.log('Using appstate.json (Note: FB_APPSTATE env var is recommended for security)');
        const appState: AppState[] = JSON.parse(fs.readFileSync(appStatePath, 'utf8'));
        // We can either pass it to client or let client read from env if we set it (but here we pass it)
        // For demonstration, we'll pass it.
    } else {
        console.error('No appstate found. Please set FB_APPSTATE environment variable or create appstate.json');
        process.exit(1);
    }
  }

  const client = new PanindiganClient({
    listenEvents: true
  });

  try {
    // Client will automatically check process.env.FB_APPSTATE if appState is not provided here
    // If using appstate.json, you would do: await client.login({ appState });
    // If using ENV, just: await client.login();
    
    // We will try to load from file if ENV is missing to support the fallback logic above
    let loginOptions = {};
    const appStatePath = path.join(__dirname, 'appstate.json');
    if (!process.env.FB_APPSTATE && fs.existsSync(appStatePath)) {
        loginOptions = { appState: JSON.parse(fs.readFileSync(appStatePath, 'utf8')) };
    }

    await client.login(loginOptions);
    console.log('Logged in successfully!');

    client.on((event) => {
      console.log('Received event:', JSON.stringify(event, null, 2));
    });

    // Example: Fetch threads
    const threads = await client.getThreadList(5);
    console.log(`Fetched ${threads.length} threads.`);
    
    // Example: Send message (uncomment to test)
    // if (threads.length > 0) {
    //   await client.sendMessage(threads[0].threadId, 'Hello from Panindigan!');
    // }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
