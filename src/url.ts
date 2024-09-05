import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

/**
 * Returns the GitHub token from the .env file.
 * 
 * @returns {string} - The GitHub token.
 */
function getToken(){
    const githubToken = process.env.GITHUB_TOKEN;
    if(!githubToken){
        console.error('GITHUB_TOKEN is not set in .env file');
    }
    return githubToken;
}
/**
 * Fetches the count of pull requests from a GitHub repository.
 * 
 * This function makes a GET request to the GitHub API to retrieve
 * the total number of pull requests for the specified repository.
 * 
 * @throws {Error} - Throws an error if the request fails or the response cannot be parsed.
 */
export function test_API(){

    const githubToken = getToken();
    const OWNER = 'nikivakil';
    const REPO = '461-team';
    
    const getPullRequestCount = async() =>{
        try{
            //Make a GET request to the Github API
            const response = await axios.get(`https://api.github.com/repos/${OWNER}/${REPO}/pulls?state=all`, {
                headers: {
                    Authorization: `token ${githubToken}`
                }
            });
            //Log the number of pull requests in the console
            console.log(response.data.length);
        } catch (error){
            console.error('Error fetching pull requests: ', error);
        }
    }
    getPullRequestCount();
}


