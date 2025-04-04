import fs from 'fs';
import path from 'path';
import os from 'os';

// Get server IP address
function getLocalIpAddress() {
  const networkInterfaces = os.networkInterfaces();
  let ipAddress = '';
  
  // Look for IPv4 addresses that aren't internal (like 127.0.0.1)
  Object.keys(networkInterfaces).forEach((ifname) => {
    networkInterfaces[ifname].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        ipAddress = iface.address;
      }
    });
  });
  
  return ipAddress || '192.168.43.161'; // fallback to default
}

async function updateServerIp(newIp, port = '5001') {
  const storeFilePath = path.join(__dirname, 'redux', 'store.js');
  
  try {
    // Read the current file
    const content = fs.readFileSync(storeFilePath, 'utf8');
    
    // Replace the server IP address
    const updatedContent = content.replace(
      /export const server = "http:\/\/[^:]+:(\d+)\/api\/v1";/,
      `export const server = "http://${newIp}:${port}/api/v1";`
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(storeFilePath, updatedContent, 'utf8');
    
    console.log(`Server IP updated to: http://${newIp}:${port}/api/v1`);
    return true;
  } catch (error) {
    console.error('Error updating server IP:', error.message);
    return false;
  }
}

// Main function
async function main() {
  const localIp = getLocalIpAddress();
  console.log('Detected local IP address:', localIp);
  
  if (process.argv.length > 2) {
    // If an IP is provided as command line argument
    const customIp = process.argv[2];
    await updateServerIp(customIp);
  } else {
    // Otherwise use the detected local IP
    await updateServerIp(localIp);
  }
}

// Run the script
main().catch(console.error);

// Instructions to run:
// 1. To use automatically detected IP: node updateServerIP.js
// 2. To specify custom IP: node updateServerIP.js 192.168.1.10 