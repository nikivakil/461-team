import axios from 'axios';
import { getToken } from '../url'; // Assuming getToken is imported from url.ts

export async function getIssues(owner: string, repo: string) { // fetches all issues (open, closed, etc)
    const token = getToken(); // requires token for authorization
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=all`;

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `token ${token}`
            }
        });
        return response.data; // returns list of issues
    } catch (error) {
        console.error('Error fetching issues:', error);
        throw error; // or returns error
    }
}

export function analyzeIssues(issues: any[]) { // analyzes list of issues
    const openIssues = issues.filter(issue => issue.state === 'open'); // counts open issues
    const closedIssues = issues.filter(issue => issue.state === 'closed'); // counts closed issues
    
    // Time to close (for closed issues)
    const closeTimes = closedIssues.map(issue => {
        const createdAt = new Date(issue.created_at).getTime();
        const closedAt = new Date(issue.closed_at).getTime();
        return (closedAt - createdAt) / (1000 * 60 * 60); // time in hours
    });
    const avgTimeToClose = closeTimes.length > 0 ? 
        (closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length) : 0;

    return {
        totalIssues: issues.length,
        openIssues: openIssues.length,
        closedIssues: closedIssues.length,
        avgTimeToClose
    };
}

export async function getPullRequests(owner: string, repo: string) { // gets all pull requests 
    const token = getToken(); // requires token for authorization
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all`;

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `token ${token}`
            }
        });
        return response.data; // returns list of pull requests
    } catch (error) {
        console.error('Error fetching pull requests:', error);
        throw error; // or returns error
    }
}

export function analyzePullRequests(pullRequests: any[]) { // analyzes pull requests
    const openPRs = pullRequests.filter(pr => pr.state === 'open'); // counts open pull requests
    const closedPRs = pullRequests.filter(pr => pr.state === 'closed'); // counts closed pull requests
    
    // Time to close (for closed PRs)
    const closeTimes = closedPRs.map(pr => {
        const createdAt = new Date(pr.created_at).getTime();
        const closedAt = new Date(pr.closed_at).getTime();
        return (closedAt - createdAt) / (1000 * 60 * 60); // time in hours
    });
    const avgTimeToClose = closeTimes.length > 0 ? 
        (closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length) : 0;

    return {
        totalPRs: pullRequests.length,
        openPRs: openPRs.length,
        closedPRs: closedPRs.length,
        avgTimeToClose
    };
}

export async function analyzeRepo(owner: string, repo: string) { // fetches issues and pull requests
    try {
        // Fetch issues and pull requests
        const [issues, pullRequests] = await Promise.all([
            getIssues(owner, repo),
            getPullRequests(owner, repo)
        ]);

        // Analyze issues and pull requests
        const issueAnalysis = analyzeIssues(issues);
        const prAnalysis = analyzePullRequests(pullRequests);

        return {
            issueAnalysis,
            prAnalysis
        };
    } catch (error) {
        console.error('Error analyzing repository:', error);
        throw error;
    }
}

function parseRepoUrl(url: string): { owner: string, repo: string } {
    const match = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/);
    if (!match) throw new Error('Invalid GitHub URL');
    return { owner: match[1], repo: match[2] };
}

export async function get_responsiveness_metric(repoUrl: string): Promise<number> {
    try {
        const { owner, repo } = parseRepoUrl(repoUrl);

        // Fetch and analyze issues and pull requests
        const [issues, pullRequests] = await Promise.all([
            getIssues(owner, repo),
            getPullRequests(owner, repo)
        ]);

        const issueAnalysis = analyzeIssues(issues);
        const prAnalysis = analyzePullRequests(pullRequests);

        // Compute responsiveness score based on metrics
        const avgTimeToClose = (issueAnalysis.avgTimeToClose + prAnalysis.avgTimeToClose) / 2;
        const maxTimeToClose = 100; // Define a reasonable max time (in hours) for normalization
        const score = Math.max(0, 1 - avgTimeToClose / maxTimeToClose);

        return score;
    } catch (error) {
        console.error('Error calculating responsiveness metric:', error);
        throw error;
    }
}

// Usage example
const REPO_URL = 'https://github.com/nikivakil/461-team';

get_responsiveness_metric(REPO_URL)
    .then(score => {
        console.log('Responsiveness Score:', score);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
