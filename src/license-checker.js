// Import the built-in 'fs' (File System) module in Node.js
const fs = require('fs');

// Define the file path of the LICENSE file to read
const filePath = './LICENSE.txt';  // Path to the file

// First, read the content of the LICENSE file asynchronously
fs.readFile(filePath, 'utf8', (err, data) => {
    // If an error occurs during the file reading process, log the error
    if (err) {
        console.error('Error reading file:', err);
    } else {
        // If successful, print the file content to the console
        //console.log(data);
    }
});

// Create a regular expression to find the license version (e.g., "GNU Lesser General Public License, version 2.1")
const licenseRegex = /GNU Lesser General Public License, version\s+(\d\.\d)/i;

// Read the LICENSE file again and try to match the license version using the regex
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        // Log any error if the file can't be read
        console.error('Error reading file:', err);
    } else {
        // Match the license text to extract the version (if it exists)
        const match = data.match(licenseRegex);
        if (match) {
            // If a match is found, log the version number to the console
            console.log('License version found:', match[1]);
        } else {
            // If no match is found, log that no valid license was found
            console.log('No valid license found.');
        }
    }
});

// Define a function to check if the license is LGPL version 2.1
const checkLGPLv2_1 = (licenseText) => {
    // Create a regular expression specifically for LGPLv2.1
    const lgplRegex = /GNU Lesser General Public License, version 2\.1/i;
    // Return true if the license text matches LGPLv2.1, otherwise false
    return lgplRegex.test(licenseText);
};

// Read the LICENSE file once again and check if it is LGPLv2.1 compatible
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        // Log any error that occurs during reading the file
        console.error('Error reading file:', err);
    } else {
        // Use the checkLGPLv2_1 function to verify if the license is compatible with LGPLv2.1
        if (checkLGPLv2_1(data)) {
            console.log('This file is LGPLv2.1 compatible.');
        } else {
            console.log('This file is not LGPLv2.1 compatible.');
        }
    }
});
