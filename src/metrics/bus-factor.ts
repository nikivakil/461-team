import axios from 'axios';
import { getToken } from '../url'; // Import the function to get GitHub token

/**
 * Fetches the commit history for a GitHub repository.
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @returns The list of commits.
 */
async function getCommits(owner: string, repo: string) {
    const token = getToken(); // Retrieve the GitHub token
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits`; // GitHub API URL to fetch commits

    try {
        // Make a GET request to the GitHub API
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `token ${token}` // Include token in the request header for authorization
            }
        });
        return response.data; // Return the list of commits
    } catch (error) {
        console.error('Error fetching commits:', error); // Log any error that occurs
        throw error; // Rethrow the error for further handling
    }
}

/**
 * Fetches contributor stats for a GitHub repository.
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @returns The list of contributors.
 */
async function getContributors(owner: string, repo: string) {
    const token = getToken(); // Retrieve the GitHub token
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contributors`; // GitHub API URL to fetch contributors

    try {
        // Make a GET request to the GitHub API
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `token ${token}` // Include token in the request header for authorization
            }
        });
        return response.data; // Return the list of contributors
    } catch (error) {
        console.error('Error fetching contributors:', error); // Log any error that occurs
        throw error; // Rethrow the error for further handling
    }
}

/**
 * Analyzes the contribution distribution based on commits and contributors.
 * @param commits - The list of commits.
 * @param contributors - The list of contributors.
 * @returns An object with analysis results.
 */
function analyzeContributionDistribution(commits: any[], contributors: any[]) {
    const commitCounts: { [key: string]: number } = {}; // Initialize an object to track commits per author
    
    // Count the number of commits per author
    commits.forEach(commit => {
        const author = commit.commit.author.name; // Get the author of the commit
        commitCounts[author] = (commitCounts[author] || 0) + 1; // Increment the commit count for the author
    });

    const totalCommits = commits.length; // Total number of commits
    const totalContributors = contributors.length; // Total number of contributors

    const distribution = Object.values(commitCounts); // Array of commit counts per author
    const maxCommits = Math.max(...distribution, 1); // Find the maximum number of commits by a single author (avoid division by zero)

    // Calculate the bus factor
    let accumulatedCommits = 0;
    let busFactor = 0;

    // Sort authors by number of commits in descending order
    for (const count of distribution.sort((a, b) => b - a)) {
        accumulatedCommits += count; // Accumulate the number of commits
        busFactor += 1; // Count the number of top contributors
        if (accumulatedCommits >= totalCommits / 2) break; // Stop when half of the commits are accounted for
    }

    return {
        totalCommits,
        totalContributors,
        maxCommits,
        busFactor // Number of contributors needed to reach half of the total commits
    };
}

/**
 * Gets the bus factor metric for a GitHub repository.
 * @param repoUrl - The URL of the GitHub repository.
 * @returns An object with contribution distribution analysis.
 */
export async function get_bus_factor(repoUrl: string) {
    try {
        const { owner, repo } = parseRepoUrl(repoUrl); // Extract owner and repo from the URL

        // Fetch and analyze commits and contributors
        const [commits, contributors] = await Promise.all([
            getCommits(owner, repo),
            getContributors(owner, repo)
        ]);

        const analysis = analyzeContributionDistribution(commits, contributors); // Analyze contribution distribution

        return analysis; // Return the analysis results
    } catch (error) {
        console.error('Error calculating bus factor:', error); // Log any error that occurs
        throw error; // Rethrow the error for further handling
    }
}

/**
 * Extracts owner and repo from a GitHub repository URL.
 * @param url - The GitHub repository URL.
 * @returns An object with owner and repo.
 */
function parseRepoUrl(url: string): { owner: string, repo: string } {
    const match = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/); // Regex to parse the owner and repo from the URL
    if (!match) throw new Error('Invalid GitHub URL'); // Throw error if URL does not match the expected format
    return { owner: match[1], repo: match[2] }; // Return the extracted owner and repo
}

// Usage example
const REPO_URL = 'https://github.com/nikivakil/461-team'; // Example repository URL

get_bus_factor(REPO_URL)
    .then(analysis => {
        console.log('Bus Factor Analysis:', analysis); // Log the analysis results
    })
    .catch(error => {
        console.error('Error:', error.message); // Log any error that occurs
    });
