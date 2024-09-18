#!/usr/bin/env ts-node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { getReadmeContent, parseGitHubUrl, classifyURL, UrlType, extractNpmPackageName, getNpmPackageGitHubUrl } from './url';
import {get_bus_factor} from './metrics/bus-factor';
import {getCorrectnessMetric} from './metrics/correctness';
import { get_license_compatibility } from './metrics/license-compatibility';
import { get_ramp_up_time_metric } from './metrics/ramp-up-time';
import { calculateResponsiveness } from './metrics/responsiveness';
import logger from './logger';

interface MetricsResult {
  URL: string;
  NetScore: number;
  NetScore_Latency: number;
  RampUp: number;
  RampUp_Latency: number;
  Correctness: number;
  Correctness_Latency: number;
  BusFactor: number;
  BusFactor_Latency: number;
  ResponsiveMaintainer: number;
  ResponsiveMaintainer_Latency: number;
  License: number;
  License_Latency: number;
}

async function cloneRepository(url: string, dir: string): Promise<void> {
  if (fs.existsSync(path.join(dir, '.git'))) {
    logger.debug(`Repository already exists, skipping clone: ${url}`);
    return;
  }

  try {
    logger.info(`Cloning repository: ${url}`);
    await git.clone({
      fs,
      http,
      dir,
      url,
      singleBranch: true,
      depth: 1
    });
    logger.info(`Repository cloned successfully: ${url}`);
  } catch (error) {
    logger.error(`Error cloning repository ${url}:`, { error });
    throw error;
  }
}

async function processUrl(url: string): Promise<MetricsResult> {
  const urlType = classifyURL(url);
  let githubUrl = '';

  switch (urlType) {
    case UrlType.GitHub:
      githubUrl = url;
      break;
    case UrlType.NPM:
      const packageName = extractNpmPackageName(url);
      if (packageName) {
        const extractedGithubUrl = await getNpmPackageGitHubUrl(packageName);
        if (extractedGithubUrl) {
          githubUrl = extractedGithubUrl;
          logger.info(`NPM package ${url} converted to GitHub URL: ${githubUrl}`);
        } else {
          logger.error(`Unable to extract GitHub URL for NPM package: ${url}`);
          return createEmptyMetricsResult(url);
        }
      } else {
        logger.error(`Invalid NPM package URL: ${url}`);
        return createEmptyMetricsResult(url);
      }
      break;
    case UrlType.Other:
      logger.error(`Unsupported URL type: ${url}`);
      return createEmptyMetricsResult(url);
  }

  const repoInfo = parseGitHubUrl(githubUrl);
  if (repoInfo) {
    try {
      const cloneDir = path.join(process.cwd(), 'cloned_repos', `${repoInfo.owner}_${repoInfo.repo}`);
      await cloneRepository(githubUrl, cloneDir);
      return getMetrics(githubUrl, cloneDir);
    } catch (error) {
      logger.error(`Error processing ${githubUrl}:`, { error });
      return createEmptyMetricsResult(url);
    }
  } else {
    logger.error(`Invalid GitHub URL: ${githubUrl}`);
    return createEmptyMetricsResult(url);
  }
}

async function getMetrics(url: string, cloneDir: string): Promise<MetricsResult> {
  try {
    const startTime = Date.now();
    
    const [
      correctnessResult,
      busFactorResult,
      licenseCompatibility,
      rampUpTime,
      responsivenessResult
    ] = await Promise.all([
      getCorrectnessMetric(url),
      get_bus_factor(url),
      get_license_compatibility(cloneDir),
      get_ramp_up_time_metric(url),
      calculateResponsiveness(url)
    ]);

    const endTime = Date.now();
    const totalLatency = endTime - startTime;

    const netScore = calculateNetScore(
      correctnessResult.score,
      busFactorResult.normalizedScore,
      licenseCompatibility.score,
      rampUpTime.score,
      responsivenessResult.score
    );

    logger.info('Metrics calculated', { 
      url, 
      netScore, 
      totalLatency,
      correctness: correctnessResult.score,
      busFactor: busFactorResult.normalizedScore,
      license: licenseCompatibility.score,
      rampUp: rampUpTime.score,
      responsiveness: responsivenessResult.score
    });

    return {
      URL: url,
      NetScore: netScore,
      NetScore_Latency: totalLatency,
      RampUp: rampUpTime.score,
      RampUp_Latency: rampUpTime.latency,
      Correctness: correctnessResult.score,
      Correctness_Latency: correctnessResult.latency,
      BusFactor: busFactorResult.normalizedScore,
      BusFactor_Latency: busFactorResult.latency,  // Now using the latency from busFactorResult
      ResponsiveMaintainer: responsivenessResult.score,
      ResponsiveMaintainer_Latency: responsivenessResult.latency,
      License: licenseCompatibility.score,
      License_Latency: licenseCompatibility.latency
    };
  } catch (error) {
    logger.error(`Error calculating metrics for ${url}:`, error);
    return createEmptyMetricsResult(url);
  }
}
function calculateNetScore(correctness: number, busFactor: number, license: number, rampUp: number, responsiveness: number): number {
  const weights = {
    correctness: 0.25,
    busFactor: 0.25,
    responsiveness: 0.2,
    rampUp: 0.2,
    license: 0.1
  };

  return (
    correctness * weights.correctness +
    busFactor * weights.busFactor +
    responsiveness * weights.responsiveness +
    rampUp * weights.rampUp +
    license * weights.license
  );
}


function createEmptyMetricsResult(url: string): MetricsResult {
  return {
    URL: url,
    NetScore: 0,
    NetScore_Latency: 0,
    RampUp: 0,
    RampUp_Latency: 0,
    Correctness: 0,
    Correctness_Latency: 0,
    BusFactor: 0,
    BusFactor_Latency: 0,
    ResponsiveMaintainer: 0,
    ResponsiveMaintainer_Latency: 0,
    License: 0,
    License_Latency: 0
  };
}

const program = new Command();

program
  .version('1.0.0')
  .description('ACME Module Trustworthiness CLI');

program
  .command('install')
  .description('Install dependencies')
  .action(() => {
    logger.info('Installing dependencies...');
    // Add your installation logic here
    process.exit(0);
  });

program
  .command('URL_FILE <file>')
  .description('Process URLs from a file')
  .action(async (file: string) => {
    try {
      const absolutePath = path.resolve(file);
      const urls = fs.readFileSync(absolutePath, 'utf-8').split('\n').filter(url => url.trim() !== '');
      
      for (const url of urls) {
        try {
          const result = await processUrl(url);
          logger.info('URL processing result', { url, result });
          console.log(JSON.stringify(result)); // Keep this for CLI output
        } catch (error) {
          logger.error(`Error processing URL ${url}:`, { error });
          console.log(JSON.stringify(createEmptyMetricsResult(url))); // Keep this for CLI output
        }
      }
      
      process.exit(0);
    } catch (error) {
      logger.error('Error processing URL file:', { error });
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Run test suite')
  .action(() => {
    logger.info('Running test suite...');

    const resultsFilePath = path.resolve(__dirname, '../jest-results.json');
    const coverageSummaryPath = path.resolve(__dirname, '../coverage/coverage-summary.json');

    const jestProcess = spawn('npx', [
      'jest',
      '--silent',
      '--coverage',
      '--json',
      `--outputFile=${resultsFilePath}`
    ]);

    jestProcess.on('close', () => {
      const checkFileExists = (filePath: string, retries: number = 5) => {
        if (fs.existsSync(filePath)) {
          return true;
        }
        if (retries > 0) {
          setTimeout(() => checkFileExists(filePath, retries - 1), 1000);
        }
        return false;
      };

      if (!checkFileExists(coverageSummaryPath)) {
        logger.error('Coverage summary file does not exist:', { path: coverageSummaryPath });
        return;
      }

      try {
        const results = JSON.parse(fs.readFileSync(resultsFilePath, 'utf-8'));
        const coverageSummary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf-8'));

        const lineCoverage = coverageSummary.total.lines.pct;

        logger.info('Test results', {
          total: results.numTotalTests,
          passed: results.numPassedTests,
          lineCoverage: `${lineCoverage}%`
        });
        console.log(`${results.numPassedTests}/${results.numTotalTests} test cases passed. ${lineCoverage}% line coverage achieved.`);
      } catch (error) {
        logger.error('Error reading Jest results or coverage summary:', { error });
      } finally {
        if (fs.existsSync(resultsFilePath)) {
          fs.unlinkSync(resultsFilePath);
        }
      }
    });
  });

program.parse(process.argv);