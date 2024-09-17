// correctness.ts
import { getToken, get_axios_params, getOpenIssues, getClosedIssues, getOpenPRs, getClosedPRs } from '../url';

// Function to calculate correctness metric based on issues and pull requests
export async function getCorrectnessMetric(gitHubUrl: string): Promise<number> {
    try {
        const token = getToken();
        const { owner, repo, headers } = get_axios_params(gitHubUrl, token);
        
        // Fetch data for issues and pull requests
        const openIssues = await getOpenIssues(owner, repo, headers);
        const closedIssues = await getClosedIssues(owner, repo, headers);
        const openPRs = await getOpenPRs(owner, repo, headers);
        const closedPRs = await getClosedPRs(owner, repo, headers);

        const totalIssues = openIssues + closedIssues;
        const totalPRs = openPRs + closedPRs;

        // Calculate correctness score: more closed issues and PRs mean better correctness
        const correctnessScore = (totalIssues + totalPRs > 0)
            ? (closedIssues + closedPRs) / (totalIssues + totalPRs)
            : 0;

        return Math.min(Math.max(correctnessScore, 0), 1); // Ensure score is between 0 and 1
    } catch (error) {
        console.error('Error calculating correctness:', error);
        return 0; // Return 0 on error
    }
}
