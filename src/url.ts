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