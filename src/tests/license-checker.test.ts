

import fs from 'fs';
import { getLicenseFromLicenseFile, getLicenseFromReadme } from '../license-checker';
import path from 'path';
//import { getLicenseFromReadme, getLicenseFromLicenseFile, isLicenseCompatible, checkProjectLicenses } from '../license-checker';

jest.mock('fs'); // mocking the file system

describe('getLicenseFromReadme', () => {
    it('should extract the license from README', () => {
        const readmeContent = '## License\nMIT'; 
        const result = getLicenseFromReadme(readmeContent);
        expect(result).toBe('MIT');
    });

    it('should return null if no license section is found', () => {
        const readmeContent = '## No License Info Here';
        const result = getLicenseFromReadme(readmeContent);
        expect(result).toBeNull();
    });
});

describe('getLicenseFromLicenseFile', () => {
    beforeEach(() => {
        (fs.existsSync as jest.Mock).mockReset();
        (fs.readFileSync as jest.Mock).mockReset();
    });

    it('should return the license text if LICENSE file exists', () => {
        const licenseContent = 'MIT License';
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue(licenseContent);
        
        
        const result = getLicenseFromLicenseFile(path.join(__dirname, '../src/LICENSE.txt'));
        expect(result).toBe('MIT License');
    });

    it('should return null if LICENSE file does not exist', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);
        
        const result = getLicenseFromLicenseFile(path.join(__dirname, '../src/LICENSE.txt'));
        expect(result).toBeNull();
    });
});
