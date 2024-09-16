import * as dotenv from 'dotenv';
import axios from 'axios';
import * as responsive from './metrics/responsiveness';

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
interface Comment{ // interface for the comment object 
    created_at: string; // time the comment was created
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
export function getToken(): string {
    const githubToken = process.env.GITHUB_TOKEN;
    if(!githubToken){
        console.error('GITHUB_TOKEN is not set in .env file');
    }
    return githubToken as string;
}

/**
 * Fetches the count of pull requests from a GitHub repository.
 * 
 * This function makes a GET request to the GitHub API to retrieve
 * the total number of pull requests for the specified repository.
 * 
 * @throws {Error} - Throws an error if the request fails or the response cannot be parsed.
 */
export function test_API(): void {
    const githubToken = getToken();
    const OWNER = 'nikivakil';
    const REPO = '461-team';
    
    const getPullRequestCount = async() => {
        try {
            // Make a GET request to the Github API
            const response = await axios.get(`https://api.github.com/repos/${OWNER}/${REPO}/pulls?state=all`, {
                headers: {
                    Authorization: `token ${githubToken}`
                }
            });
            // Log the number of pull requests in the console
            console.log(response.data.length);
        } catch (error) {
            console.error('Error fetching pull requests: ', error);
        }
    }
    getPullRequestCount();
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

/**
 * Parses a GitHub URL to extract owner and repo information.
 * 
 * @param {string} url - The GitHub URL to parse.
 * @returns {{ owner: string; repo: string } | null} - An object containing owner and repo, or null if invalid.
 */
function parseGitHubUrl(url: string): { owner: string; repo: string }{
    const match = url.match(/github.com\/([^/]+)\/([^/]+)/);
    return match ? { owner: match[1], repo: match[2] } : { owner: '', repo: '' };
  }


export function get_axios_params(url: string, token: string): {owner: string, repo: string, headers: any}{
    const {owner, repo} = parseGitHubUrl(url);
    const headers = {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json'
    };
    return {owner, repo, headers};
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
        // Get repository contents
        const response = await axios.get<RepoContent[]>(apiUrl, { headers });

        // Find README file
        const readmeFile = response.data.find(file => file.name.toLowerCase().startsWith('readme'));
        if (!readmeFile) {
            throw new Error('README file not found');
        }

        // Get README content
        const readmeResponse = await axios.get<ReadmeContent>(readmeFile.url, { headers });

        // Decode content
        const decodedContent = Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8');

        return decodedContent;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`API request failed: ${error.response?.status} ${error.response?.statusText}`);
        }
        throw error;
    }
}

// Usage example for getReadmeContent
export function test_getReadmeContent(): void {
    const OWNER = 'nikivakil';
    const REPO = '461-team';

    getReadmeContent(OWNER, REPO)
        .then(readmeContent => console.log(readmeContent))
        .catch(error => console.error('Error:', error.message));
}
export async function get_avg_ClosureTime(owner: string, repo: string, headers: any){
    try{
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues?state=closed`, {headers});
        
        let totalClosureTime = 0;
        let totalIssues = 0;
        for(const issue of response.data){
            if(issue.state === 'closed'){
                totalClosureTime += responsive.getTimeDifferenceInHours(issue.created_at, issue.closed_at);
                totalIssues++;
            }
        }
        if(totalIssues === 0){
            return 0;
        }
        return totalClosureTime / totalIssues;
    }
    catch(error){
        console.error(error);
    }
    
}

export async function getComments(owner: string, repo: string, number: number, headers: any): Promise<Comment[]>{ //function to get the comments on a PR returns a promise of an array of comments
    try{
        const response = await axios.get<Comment[]>(`https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments`, {headers});
        return response.data;
    }
    catch(error){
        console.error(error);
        return [];
    }
}
export async function get_avg_Responsetime(owner: string, repo: string, headers: any){
    try{
        const Pulls = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`, {headers});
        let total_Pulls = 0;
        let total = 0;

        for(const pull of Pulls.data){
            const PR_number = pull.number;
            const comments = await getComments(owner, repo, PR_number, headers);
            if(comments.length == 0){
                total_Pulls++;
                continue;
            }
            else if(comments.length == 1){
                total += responsive.getTimeDifferenceInHours(pull.created_at,comments[0].created_at);
            }
            else{
                comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); //sort the comments based on the time they were created
                total += responsive.getTimeDifferenceInHours(pull.created_at,comments[0].created_at); //calculate the time between the first comment and the PR creation
            }
            
            total_Pulls++;

        }
        if(total_Pulls == 0){
            return 0;
        }
        return total / total_Pulls;

    }
    catch(error){
        console.error(error);
    }
}