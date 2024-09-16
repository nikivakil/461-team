import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Returns the GitHub token from the .env file.
 * 
 * @returns {string} - The GitHub token.
 */
function getToken(): string {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is not set in .env file');
  }
  return githubToken;
}

/**
 * Fetches open issues and pull requests from a GitHub repository.
 * 
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @returns {Promise<any[]>} - A promise that resolves to an array of issues/PRs.
 * @throws {Error} - Throws an error if the API request fails.
 */
async function fetchIssuesAndPRs(owner: string, repo: string): Promise<any[]> {
  const token = getToken();
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, { headers });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching issues: ${error.message}`);
  }
}

/**
 * Analyzes correctness by checking the number of bug-related issues.
 * 
 * @param {any[]} issues - The array of issues/PRs.
 * @returns {number} - The correctness score (0.0 to 1.0).
 */
function analyzeCorrectness(issues: any[]): number {
  const bugLabels = ['bug', 'error', 'failure'];
  const bugIssues = issues.filter(issue => issue.labels.some((label: any) => bugLabels.includes(label.name)));
  const totalIssues = issues.length;
  
  const bugRatio = totalIssues > 0 ? bugIssues.length / totalIssues : 0;
  const correctnessScore = bugRatio > 0.3 ? 0.5 : 1.0; // Adjust score based on bug ratio

  return correctnessScore;
}

/**
 * Evaluates the correctness score of a repository.
 * 
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @returns {Promise<{ correctness: number; latency: number }>} - The correctness score and API latency.
 */
export async function evaluateCorrectness(owner: string, repo: string): Promise<{ correctness: number; latency: number }> {
  const startTime = Date.now();
  const issues = await fetchIssuesAndPRs(owner, repo);
  const correctness = analyzeCorrectness(issues);
  const latency = (Date.now() - startTime) / 1000; // Latency in seconds

  return { correctness, latency };
}
