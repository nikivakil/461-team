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
function getToken(): string {
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

function parseGithubURL(url:string): {owner: string, repo: string}{ 
    const match= url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if(!match){
        console.error('Invalid GitHub URL');
    }
    return match ? {owner: match[1], repo: match[2]} : {owner: '', repo: ''};
}

async function getIssues(owner: string, repo: string, token: string){

    try{
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues?state=all`, {  //get request to the github api for the issues
            headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        return response.data; //return the data from the response
    } catch (error){
        console.error('Error fetching issues: ', error);
    }
}

async function getTimeline(owner: string, repo: string, token: string, issue_number: number){
    try{
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}/timeline`, { //get request to the github api for the timeline
            headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        return response.data; //return the data from the response
    } catch (error){
        console.error('Error fetching timeline: ', error);
    }
}

function getTimeDifferenceInHours(start: string, end: string): number{ //function to calculate the time difference in hours
    const startTime = new Date(start);
    const endTime = new Date(end);
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
}

function calculateTimes(timeline: any): {responseTime: number, resolutionTime: number}{ //function to calculate the response time and resolution time

    let openedAt: string | null = null;
    let closedAt: string | null = null;
    let firstCommentAt: string | null = null;

    for(const event of timeline){
        if(event.event === 'opened'){
            openedAt = event.created_at;
        }
        if((event.event === 'commented' || event.event === 'reviewed') && !firstCommentAt){
            firstCommentAt = event.created_at;
        }
        if(event.event === 'closed'){
            closedAt = event.created_at;
        }


    }
    const responseTime = openedAt && firstCommentAt ? getTimeDifferenceInHours(openedAt, firstCommentAt) : 0;
    const resolutionTime = openedAt && closedAt ? getTimeDifferenceInHours(openedAt, closedAt) : 0;

    return {responseTime, resolutionTime};
}

async function responsiveness(url: string,token: string){ //function to calculate the responsiveness of the maintainer of a repository and score it
    const {owner, repo} = parseGithubURL(url); //parse the github url to get the owner and repo
    const issues = await getIssues(owner, repo, token); //get the issues from the repository

    let totalresponseTime = 0;
    let totalresolutionTime = 0;
    let count = 0;


    for(const issue of issues){ //loop through the issues 
        if(!issue.pull_request){ //check if the issue is a pull request if not 
            continue;
        }
        const timeline = await getTimeline(owner, repo, token, issue.number); //get the timeline for the issue

        const {responseTime, resolutionTime} = calculateTimes(timeline); //calculate the response time and resolution time

        totalresponseTime += responseTime; //add the response time to the total response time
        totalresolutionTime += resolutionTime; //add the resolution time to the total resolution time
        count++; //increment the count of valid issues

    }
    if(count === 0){
        console.log('No valid issues found');
        return;
    }
    else{
        //calculate the average response time and resolution time
        const avgResponseTime = totalresponseTime / count; 
        const avgResolutionTime = totalresolutionTime / count;

        console.log(`Average response time: ${avgResponseTime} hours`);
        console.log(`Average resolution time: ${avgResolutionTime} hours`);
    }
}
export function test_responsiveness(): void {
    const githubToken = getToken();
    responsiveness('https://github.com/axios/axios', githubToken);
}