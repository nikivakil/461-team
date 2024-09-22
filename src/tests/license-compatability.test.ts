import { get_license_compatibility, checkLicenseCompatibility, getLicense} from "../metrics/license-compatibility";
import logger from "../logger";
import * as fs from "fs";
import * as path from "path";

jest.mock("../logger");
jest.mock("fs");

describe('checkLicenseCompatibility', () => {
    const testCases = [
        // Valid licenses
      { name: 'MIT License', content: 'MIT License\n\nCopyright (c) [year] [fullname]', expected: true },
      { name: 'GPL v3', content: 'GNU GENERAL PUBLIC LICENSE\nVersion 3, 29 June 2007', expected: true },
      { name: 'GPL v2', content: 'GNU GENERAL PUBLIC LICENSE\nVersion 2, June 1991', expected: true },
      { name: 'LGPL v2.1', content: 'GNU LESSER GENERAL PUBLIC LICENSE\nVersion 2.1, February 1999', expected: true },
      { name: 'Apache 2.0', content: 'Apache License\nVersion 2.0, January 2004', expected: true },
      { name: 'BSD 3-Clause', content: 'BSD 3-Clause License\n\nCopyright (c) [year], [fullname]', expected: true },
      { name: 'BSD 2-Clause', content: 'BSD 2-Clause License\n\nCopyright (c) [year], [fullname]', expected: true },
      { name: 'ZLIB License', content: 'zlib License\n\n(C) [year] [fullname]', expected: true },
      // Invalid licenses
      { name: 'reglLG v2', content: 'All Rights Reserved. This software is the confidential and proprietary information...', expected: false },
      { name: 'No License', content: '', expected: false },
      { name: 'random stuff v2', content: 'random description i like hot dogs.', expected: false },
    ];
  
    testCases.forEach(({ name, content, expected }) => {
      it(`should return ${expected} for ${name}`, () => {
        const result = checkLicenseCompatibility(content);
        expect(result).toBe(expected);
      });
    });
  
    // Additional edge case
    it('edge case: case insensitivity', () => {
      expect(checkLicenseCompatibility('mit license')).toBe(true);
      expect(checkLicenseCompatibility('ApAcHe 2.0')).toBe(true);
      expect(checkLicenseCompatibility('BSD 3-CLAUSE')).toBe(true);
    });
  
  });

    // describe('getLicense', () => {
    //     it('should return the content of the LICENSE file', () => {
    //     const repoPath = 'test-repo';
    //     const licenseFile = 'LICENSE.txt';
    //     const licenseContent = 'MIT License\n\nPermission is hereby granted, free of charge, to any person obtaining a copy';
    
    //     (fs.readdirSync as jest.Mock).mockReturnValue([licenseFile]);
    //     (fs.readFileSync as jest.Mock).mockReturnValue(licenseContent);
    
    //     const result = getLicense(repoPath);
    //     expect(result).toBe(licenseContent);
    //     });
    
    //     it('should return null if no LICENSE file is found', () => {
    //     const repoPath = 'test-repo';
    
    //     (fs.readdirSync as jest.Mock).mockReturnValue(['README.md']);
    
    //     const result = getLicense(repoPath);
    //     expect(result).toBeNull();
    //     });
    // });

    // describe('get_license_compatibility', () => {
    //     it('should return a score of 1 for a compatible license', async () => {
    //         const repoPath = 'test-repo';
    //         const licenseContent = 'MIT License\n\nPermission is hereby granted, free of charge, to any person obtaining a copy';
        
    //         (getLicense as jest.Mock).mockReturnValue(licenseContent);
    //         (checkLicenseCompatibility as jest.Mock).mockReturnValue(true);
        
    //         const result = await get_license_compatibility(repoPath);
    //         expect(result).toEqual({ score: 1, latency: expect.any(Number) });
    //     });
    
    //     it('should return a score of 0 for an incompatible license', async () => {
    //         const repoPath = 'test-repo';
    //         const licenseContent = 'All Rights Reserved. This software is the confidential and proprietary information...';
        
    //         (getLicense as jest.Mock).mockReturnValue(licenseContent);
    //         (checkLicenseCompatibility as jest.Mock).mockReturnValue(false);
        
    //         const result = await get_license_compatibility(repoPath);
    //         expect(result).toEqual({ score: 0, latency: expect.any(Number) });
    //     });
    
    //     it('should return a score of 0 if no license file is found', async () => {
    //         const repoPath = 'test-repo';
        
    //         (getLicense as jest.Mock).mockReturnValue(null);
        
    //         const result = await get_license_compatibility(repoPath);
    //         expect(result).toEqual({ score: 0, latency: expect.any(Number) });
    //     });
    // });