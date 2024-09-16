import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

interface RepoContent {
    name: string;
    url: string;
  }
  
interface ReadmeContent {
    content: string;
    }

interface NpmPackageInfo {
        repository?: {
            url?: string;
        };
    }

export enum UrlType {
    GitHub,
    NPM,
    Other
}

/**
 * Returns the GitHub token from the .env file.
 * 
 * @returns {string} - The GitHub token.
 */
function getToken(): string {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('GITHUB_TOKEN is not set in .env file');
  }
  return githubToken as string;
}

/**
 * Classifies the given URL as GitHub, NPM, or Other.
 * 
 * @param {string} url - The URL to classify.
 * @returns {UrlType} - The classified URL type.
 */
export function classifyURL(url: string): UrlType {
    if (url.includes('github.com')) {
      return UrlType.GitHub;
    } else if (url.includes('npmjs.com') || url.startsWith('npm:')) {
      return UrlType.NPM;
    } else {
      return UrlType.Other;
    }
}

/**
 * Fetches the content of the README file from a GitHub repository.
 * 
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @returns {Promise<string>} - A promise that resolves to the content of the README file.
 * @throws {Error} - Throws an error if the request fails or the README file is not found.
 */
export async function getReadmeContent(owner: string, repo: string): Promise<string> {
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

/**
 * Parses a GitHub URL to extract owner and repo information.
 * 
 * @param {string} url - The GitHub URL to parse.
 * @returns {{ owner: string; repo: string } | null} - An object containing owner and repo, or null if invalid.
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github.com\/([^/]+)\/([^/]+)/);
  return match ? { owner: match[1], repo: match[2] } : null;
}

/**
 * Extracts the package name from an NPM URL.
 * 
 * @param {string} url - The NPM URL to parse.
 * @returns {string | null} - The package name or null if invalid.
 */
export function extractNpmPackageName(url: string): string | null {
    const match = url.match(/npmjs\.com\/package\/([^/]+)/);
    return match ? match[1] : null;
  }
  
  /**
   * Fetches the GitHub URL for an NPM package.
   * 
   * @param {string} packageName - The name of the NPM package.
   * @returns {Promise<string | null>} - A promise that resolves to the GitHub URL or null if not found.
   */
  export async function getNpmPackageGitHubUrl(packageName: string): Promise<string | null> {
    try {
      const response = await axios.get<NpmPackageInfo>(`https://registry.npmjs.org/${packageName}`);
      const repoUrl = response.data.repository?.url;
      
      if (repoUrl) {
        // Clean up the repository URL if needed
        return repoUrl.replace(/^git\+/, '').replace(/\.git$/, '');
      }
      return null;
    } catch (error) {
      console.error(`Error fetching NPM package info for ${packageName}:`, error);
      return null;
    }
  }