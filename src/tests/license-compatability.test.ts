import { get_license_compatibility, checkLicenseCompatibility, getLicense} from "../metrics/license-compatibility";
import logger from "../logger";
import * as fs from "fs";
import * as path from "path";


jest.mock("../logger");
jest.mock("fs");


  describe('License Compatibility Tests', () => {
    const testCases = [
        //valid licenses
        { licenseText: 'This project is licensed under The MIT License', expected: true },
        { licenseText: 'Licensed under the Apache License, Version 2.0 (the "License")', expected: true },
        { licenseText: 'This software is licensed under the GNU General Public License Version 3', expected: true },
        { licenseText: 'This is licensed under the GNU General Public License version 2', expected: true },
        { licenseText: 'This software is licensed under the BSD-3-Clause license', expected: true },
        { licenseText: 'This software uses the Lesser GNU Public License 2.1', expected: true },
        { licenseText: 'this project is licensed under the apache license 2.0', expected: true }, 
        { licenseText: 'ApAche 2.0', expected: true },
        { licenseText: 'GPL 3.0', expected: true },
        { licenseText: 'GPL 2.0', expected: true },
        { licenseText: 'BSD 3-Clause', expected: true },
        { licenseText: 'LGPL 2.1', expected: true },
        { licenseText: 'BSD 3 CLAUSE', expected: true },
        { licenseText: 'GNU GENERAL PUBLIC LICENSE VERSION 3', expected: true },
        { licenseText: 'GNU GENERAL PUBLIC LICENSE VERSION 2', expected: true },
        //invalid licenses
        { licenseText: 'I like hotdogs', expected: false },
        { licenseText: ' ', expected: false },
        { licenseText: 'GPL-64 license', expected: false },
      ];
    testCases.forEach(testCase => {
      test(`checkLicenseCompatibility returns ${testCase.expected} for license text: ${testCase.licenseText}`, () => {
        expect(checkLicenseCompatibility(testCase.licenseText)).toBe(testCase.expected);
      });
    });
});

describe('getLicense', () => {
    const repoPath = 'mock-repo-path';

    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should return license content from License file', async() => {
        const licenseContent = 'MIT License';
        (fs.readdirSync as jest.Mock).mockReturnValue(['LICENSE']);
        (fs.readFileSync as jest.Mock).mockReturnValue(licenseContent);

        const result = await getLicense(repoPath);
        expect(result).toEqual(licenseContent);
        expect(fs.readdirSync).toHaveBeenCalledWith(repoPath);
        expect(fs.readFileSync).toHaveBeenCalledWith(path.join(repoPath, 'LICENSE'), 'utf-8');
    });
    // it('should return license content from README.md if no License file exists', async() => {
    //     const licenseContent = 'MIT License';
    //     (fs.readdirSync as jest.Mock).mockReturnValue([]);
    //     (fs.existsSync as jest.Mock).mockReturnValue(true);
    //     (fs.readFileSync as jest.Mock).mockReturnValue(licenseContent);

    //     const result = await getLicense(repoPath);
    //     expect(result).toBe(licenseContent);
    //     expect(fs.readdirSync).toHaveBeenCalledWith(repoPath);
    //     expect(fs.existsSync).toHaveBeenCalledWith(path.join(repoPath, 'README.md'));
    // });

    it('should return null if no License file exists', async() => {
        (fs.readdirSync as jest.Mock).mockReturnValue([]);
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        const result = await getLicense(repoPath);
        expect(result).toBeNull();
    });
});

