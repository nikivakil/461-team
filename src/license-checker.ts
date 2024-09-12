import fs from 'fs';
import path from 'path';

// list of licenses that are considered LGPLv2.1-compatible
const lgplCompatibleLicenses: string[] = [
    'MIT', 'BSD', 'Apache', 'LGPL', 'ISC'
];

// function to read the license from the README file
function getLicenseFromReadme(readmeContent: string): string | null {
    // regex to find "License" section in the README
    const licenseRegex = /##?\s*License([\s\S]*?)(##|$)/i;
    const match = readmeContent.match(licenseRegex); // check if a "License" section exists
    return match ? match[1].trim() : null; // return the "License section if it is found"
}

// function to read the LICENSE file
function getLicenseFromLicenseFile(licenseFilePath: string): string | null {
    if (fs.existsSync(licenseFilePath)) { // check if "License" file exists
        return fs.readFileSync(licenseFilePath, 'utf-8').trim(); // return the content of the file
    }
    return null; // return NULL if no license is found
}

// function to check if the license is compatible with LGPLv2.1
function isLicenseCompatible(licenseText: string | null): boolean {
    if (!licenseText) return false;
    return lgplCompatibleLicenses.some(license => licenseText.includes(license)); // check if any compatible licenses are mentioned in the file
}

// main function to check licenses in a project directory
function checkProjectLicenses(projectDir: string): boolean {
    const readmePath = path.join(projectDir, 'README.md'); // define path to the README file
    const licensePath = fs.readdirSync(projectDir).find(file => file.startsWith('LICENSE')); // define a path to the "License" file

    let licenseText = null;

    // if a README file exists, extract license info from it
    if (fs.existsSync(readmePath)) {
        const readmeContent = fs.readFileSync(readmePath, 'utf-8');
        licenseText = getLicenseFromReadme(readmeContent);
    }

    // if license not found in README, check the separate license file
    if (!licenseText && licensePath) {
        licenseText = getLicenseFromLicenseFile(path.join(projectDir, licensePath));
    }

    // if no license text is found, return error
    if (!licenseText) {
        console.log('No license information found in this project.');
        return false;
    }

    // check if license text is compatible and return a message
    if (isLicenseCompatible(licenseText)) {
        console.log('The license is compatible with LGPLv2.1.');
        return true;
    } else {
        console.log('The license is NOT compatible with LGPLv2.1.');
        return false;
    }
}

// example usage: check licenses in a given project directory
const projectDir = './'; // assumes it is in the same directory as this file
checkProjectLicenses(projectDir);
