import fs from 'fs';
import path from 'path';
import logger from '../logger';

const COMPATIBLE_LICENSES = [
    { name: 'MIT', identifiers: ['MIT', 'MIT LICENSE'] },
    { name: 'Apache-2.0', identifiers: ['APACHE', 'APACHE 2', 'APACHE 2.0', 'APACHE LICENSE 2.0'] },
    { name: 'GPL-3.0', identifiers: ['GPL 3', 'GPL 3.0', 'GNU GENERAL PUBLIC LICENSE VERSION 3'] },
    { name: 'GPL-2.0', identifiers: ['GPL 2', 'GPL 2.0', 'GNU GENERAL PUBLIC LICENSE VERSION 2'] },
    { name: 'BSD-3-Clause', identifiers: ['BSD 3', 'BSD 3 CLAUSE', 'BSD-3-CLAUSE'] },
    { name: 'LGPL-2.1', identifiers: ['LGPL 2.1', 'LESSER GNU PUBLIC LICENSE 2.1'] }
  ];

//old const COMPATIBLE_LICENSES = [
//     { name: 'GNU LESSER GENERAL PUBLIC LICENSE V2.1', keywords: ['LGPL', 'GNU LESSER GENERAL PUBLIC LICENSE', '2.1'] },
//     { name: 'GNU GENERAL PUBLIC LICENSE V2', keywords: ['GPL', 'GNU GENERAL PUBLIC LICENSE', '2'] },
//     { name: 'GNU GENERAL PUBLIC LICENSE V3', keywords: ['GPL', 'GNU GENERAL PUBLIC LICENSE', '3'] },
//     { name: 'MIT LICENSE', keywords: ['MIT'] },
//     { name: 'BSD 2-CLAUSE LICENSE', keywords: ['BSD', '2-CLAUSE'] },
//     { name: 'BSD 3-CLAUSE LICENSE', keywords: ['BSD', '3-CLAUSE'] },
//     { name: 'APACHE LICENSE 2.0', keywords: ['APACHE', '2.0'] },
//     { name: 'ZLIB LICENSE', keywords: ['ZLIB'] },
// ];

interface LicenseResult {
    score: number;
    latency: number;
}

export async function get_license_compatibility(repoPath: string): Promise<LicenseResult> {
    const startTime = Date.now();
    logger.info('Starting license compatibility check', { repoPath });

    try {
        const license = await getLicense(repoPath);
        const compatible = license ? checkLicenseCompatibility(license) : false;
        const score = compatible ? 1 : 0;

        const endTime = Date.now();
        const latency = endTime - startTime;

        logger.info('License compatibility check complete', { 
            repoPath, 
            score, 
            latency, 
            compatible, 
            licenseFound: !!license 
        });

        return { score, latency };
    } catch (error) {
        logger.error('Error in get_license_compatibility', { 
            repoPath, 
            error: (error as Error).message 
        });
        return { score: 0, latency: 0 };
    }
}

export async function getLicense(repoPath: string): Promise<string | null> {
    logger.debug('Searching for license file', { repoPath });
    // Check for LICENSE file first
    const files = fs.readdirSync(repoPath);
    const licenseFile = files.find(file => file.toLowerCase().startsWith('license'));
    if (licenseFile) {
        logger.debug('License file found', { licenseFile });
        const licenseContent = fs.readFileSync(path.join(repoPath, licenseFile), 'utf-8');
        return licenseContent;
    }

    // If no LICENSE file, check README.md
    logger.debug('No license file found, checking README.md', { repoPath });
    const readmePath = path.join(repoPath, 'README.md');
    if (fs.existsSync(readmePath)) {
        const readmeContent = fs.readFileSync(readmePath, 'utf-8');
        const license = extractLicenseFromReadme(readmeContent);
        if (license) {
            logger.debug('License information found in README.md');
        } else {
            logger.warn('No license information found in README.md');
        }
        return license;
    }

    logger.warn('No license information found in repository', { repoPath });
    return null;
}

function extractLicenseFromReadme(readmeContent: string): string | null {
    const licenseRegex = /#+\s*Licen[cs]e\s*([\s\S]*?)(?=#+|$)/i;
    const match = readmeContent.match(licenseRegex);
    if (match) {
        logger.debug('License information extracted from README.md');
        return match[1].trim();
    }
    logger.debug('No license information found in README.md');
    return null;
}

// export function checkLicenseCompatibility(licenseText: string): boolean {
//     if(!licenseText) return false;
//     const upperCaseLicense = licenseText.toUpperCase(); // Convert to uppercase for case-insensitive comparison 
   
//     return COMPATIBLE_LICENSES.some(license => {
//         return license.keywords.every(keyword => upperCaseLicense.includes(keyword.toUpperCase()));
//     });
// }

export function checkLicenseCompatibility(licenseText: string): boolean {
    if (!licenseText) return false;
    const upperCaseLicense = licenseText.toUpperCase().trim();

    for (const license of COMPATIBLE_LICENSES) {
        if (license.identifiers.some(identifier => upperCaseLicense.includes(identifier))) {
            return true;
        }
   
    }
    return false;
}

