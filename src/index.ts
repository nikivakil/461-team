import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const program = new Command();

interface RepoContent {
  name: string;
  url: string;
}

interface ReadmeContent {
  content: string;
}

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

function getToken(): string {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('GITHUB_TOKEN is not set in .env file');
  }
  return githubToken as string;
}

async function getReadmeContent(owner: string, repo: string): Promise<string> {
  const token = getToken();
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    const response = await axios.get<RepoContent[]>(apiUrl, { headers });
    const readmeFile = response.data.find(file => file.name.toLowerCase().startsWith('readme'));
    if (!readmeFile) {
      throw new Error('README file not found');
    }

    const readmeResponse = await axios.get<ReadmeContent>(readmeFile.url, { headers });
    return Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`API request failed: ${error.response?.status} ${error.response?.statusText}`);
    }
    throw error;
  }
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  return match ? { owner: match[1], repo: match[2] } : null;
}

async function processUrl(url: string): Promise<MetricsResult> {
  const repoInfo = parseGitHubUrl(url);
  let readmeContent = '';

  if (repoInfo) {
    try {
      readmeContent = await getReadmeContent(repoInfo.owner, repoInfo.repo);
      console.log(`README content retrieved for ${url}`);
      console.log('README Content:');
      console.log('-------------------');
      console.log(readmeContent);
      console.log('-------------------');
    } catch (error) {
      console.error(`Error retrieving README for ${url}:`, error);
    }
  } else {
    console.error(`Invalid GitHub URL: ${url}`);
  }


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