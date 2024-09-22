import { get_license_compatibility, checkLicenseCompatibility, getLicense} from "../metrics/license-compatibility";
import logger from "../logger";
import * as fs from "fs";
import * as path from "path";


jest.mock("../logger");
jest.mock("fs");


describe('License Compatibility Tests', () => {
    const testCases = [
      { licenseText: 'MIT License', expected: true },
      { licenseText: 'Apache License 2.0', expected: true },
      { licenseText: 'APache 2.0', expected: true },
      { licenseText: 'GNU General Public License v3.0', expected: true },
      { licenseText: 'BSD 3-Clause License', expected: true },
      { licenseText: 'GNU Lesser General Public License v2.1', expected: true },
      { licenseText: 'This software is released under the MIT License.', expected: true },
      { licenseText: 'Licensed under Apache 2.0', expected: true },
      { licenseText: 'This project uses the GNU GPL v3', expected: true },
      { licenseText: 'Distributed under the terms of the BSD 3-Clause License', expected: true },
      { licenseText: 'LGPL 2.1 applies to this software', expected: true },
      { licenseText: 'spicy mcchicken v2', expected: false },
      { licenseText: 'Np license', expected: false },
      { licenseText: 'No license specified', expected: false },
      { licenseText: '', expected: false },
      { licenseText: 'This is not a valid open-source license', expected: false },
    ];
  
    test('verifies correct licenses', () => {
        testCases.forEach(({ licenseText, expected }) => {
          const result = checkLicenseCompatibility(licenseText);
          if (result !== expected) {
            console.log(`Failed test:
    Text: "${licenseText}"
    Expected: ${expected}, Actual: ${result}
    `);
          }
          expect(result).toBe(expected);
        });
      });
    });
  describe('getLicense', () => {
    const repoPath = 'mock-repo-path';
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return license content from License file', async () => {
      const licenseContent = 'MIT License';
      (fs.readdirSync as jest.Mock).mockReturnValue(['LICENSE']);
      (fs.readFileSync as jest.Mock).mockReturnValue(licenseContent);
  
      const result = await getLicense(repoPath);
      expect(result).toEqual(licenseContent);
      expect(fs.readdirSync).toHaveBeenCalledWith(repoPath);
      expect(fs.readFileSync).toHaveBeenCalledWith(path.join(repoPath, 'LICENSE'), 'utf-8');
    });
  
    it('should return null if no License file exists', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([]);
      (fs.existsSync as jest.Mock).mockReturnValue(false);
  
      const result = await getLicense(repoPath);
      expect(result).toBeNull();
    });
  });
