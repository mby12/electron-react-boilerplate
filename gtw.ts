// // Define the IP address
// const ipAddress = '192.168.8.26';

// // Split the IP address into octets
// const octets = ipAddress.split('.').map((octet) => parseInt(octet));

// // Convert each octet to hexadecimal
// const hexOctets = octets.map((octet) => {
//   const hex = octet.toString(16).toUpperCase();
//   // Pad with leading zero if necessary
//   return hex.length === 1 ? '0' + hex : hex;
// });

// // Combine the hexadecimal octets into a single string
// const hexIpAddress = hexOctets.join('');

// console.log('Hexadecimal IP address:', hexIpAddress);

const net = require('net');

function checkPort(ip: string, port: string, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();

    // Timeout for the connection attempt
    const timer = setTimeout(() => {
      socket.destroy();
      reject(
        new Error(
          `Timeout: Unable to connect to ${ip}:${port} within ${
            timeout / 1000
          } seconds`,
        ),
      );
    }, timeout);

    // If the connection is successful
    socket.connect(port, ip, () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(`Success: Connected to ${ip}:${port}`);
    });

    // Handle errors
    socket.on('error', (err: any) => {
      clearTimeout(timer);
      socket.destroy();
      reject(
        new Error(`Error: Unable to connect to ${ip}:${port} - ${err.message}`),
      );
    });

    // Handle unexpected closure
    socket.on('close', (hadError: any) => {
      if (hadError) {
        clearTimeout(timer);
        reject(
          new Error(
            `Close: Unable to connect to ${ip}:${port} - Connection closed unexpectedly`,
          ),
        );
      }
    });
  });
}

// Example usage
const ip = '192.168.8.20';
const port = '9100';

checkPort(ip, port)
  .then((message) => {
    console.log(message);
    return '';
  })
  .catch((err) => {
    console.error(err.message);
  });
