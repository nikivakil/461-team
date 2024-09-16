import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { getReadmeContent, parseGitHubUrl, classifyURL, UrlType, extractNpmPackageName, getNpmPackageGitHubUrl } from './url';

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

async function cloneOrUpdateRepository(url: string, dir: string): Promise<void> {
  try {
    if (fs.existsSync(path.join(dir, '.git'))) {
      console.log(`Repository already exists, updating: ${url}`);
      await git.pull({
        fs,
        http,
        dir,
        ref: 'HEAD',
        singleBranch: true
      });
      console.log(`Repository updated successfully: ${url}`);
    } else {
      console.log(`Cloning repository: ${url}`);
      await git.clone({
        fs,
        http,
        dir,
        url,
        singleBranch: true,
        depth: 1
      });
      console.log(`Repository cloned successfully: ${url}`);
    }
  } catch (error) {
    console.error(`Error cloning/updating repository ${url}:`, error);
    throw error;
  }
}

async function processUrl(url: string): Promise<MetricsResult> {
  const urlType = classifyURL(url);
  let readmeContent = '';
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
          console.log(`NPM package ${url} converted to GitHub URL: ${githubUrl}`);
        } else {
          console.error(`Unable to extract GitHub URL for NPM package: ${url}`);
          return createEmptyMetricsResult(url);
        }
      } else {
        console.error(`Invalid NPM package URL: ${url}`);
        return createEmptyMetricsResult(url);
      }
      break;
    case UrlType.Other:
      console.error(`Unsupported URL type: ${url}`);
      return createEmptyMetricsResult(url);
  }

  const repoInfo = parseGitHubUrl(githubUrl);
  if (repoInfo) {
    try {
      // Clone or update the repository
      const cloneDir = path.join(process.cwd(), 'cloned_repos', `${repoInfo.owner}_${repoInfo.repo}`);
      await cloneOrUpdateRepository(githubUrl, cloneDir);

      // Get README content
      readmeContent = await getReadmeContent(repoInfo.owner, repoInfo.repo);
      console.log(`README content retrieved for ${githubUrl}`);
      // console.log('README Content:');
      // console.log('-------------------');
      // console.log(readmeContent);
      // console.log('-------------------');

      // TODO: Implement metric calculations using the cloned repository
      // For now, we'll return an empty metrics result
      return createEmptyMetricsResult(url);
    } catch (error) {
      console.error(`Error processing ${githubUrl}:`, error);
      return createEmptyMetricsResult(url);
    }
  } else {
    console.error(`Invalid GitHub URL: ${githubUrl}`);
    return createEmptyMetricsResult(url);
  }
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
    console.log('Installing dependencies...');
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
      
      const results = await Promise.all(urls.map(processUrl));
      
      results.forEach(result => {
        console.log(JSON.stringify(result));
      });
      
      process.exit(0);
    } catch (error) {
      console.error('Error processing URL file:', error);
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Run test suite')
  .action(() => {
    console.log('Running test suite...');
    // Add your test suite execution logic here
    console.log('X/Y test cases passed. Z% line coverage achieved.');
    process.exit(0);
  });

program.parse(process.argv);
