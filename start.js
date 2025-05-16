
const { spawn } = require('child_process');
const path = require('path');

// Log message
console.log('Starting iPhone Cameroun application...');
console.log('Initializing backend server and database...');

// Function to get the appropriate npm command based on platform
function getNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

// Start the backend server
const backend = spawn('node', ['server/index.js'], { stdio: 'inherit' });

// Give the backend some time to start before launching the frontend
setTimeout(() => {
  console.log('Starting frontend application...');
  
  // Start the frontend using npm run dev with the correct npm command for the platform
  const npmCommand = getNpmCommand();
  const frontend = spawn(npmCommand, ['run', 'dev'], { stdio: 'inherit' });
  
  // Handle frontend process events
  frontend.on('error', (error) => {
    console.error(`Failed to start frontend: ${error.message}`);
  });
  
  console.log('Frontend started! Access the application at:');
  console.log('- Admin panel: http://localhost:8080/admin');
  console.log('- User website: http://localhost:8080');
}, 3000);

// Handle backend process events
backend.on('error', (error) => {
  console.error(`Failed to start backend: ${error.message}`);
});
