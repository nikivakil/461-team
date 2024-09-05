import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
//function tests interaction with GITHUB API retrieves number of pull requests within a repository
export function test_API(){
    const githubToken = process.env.GITHUB_TOKEN; //get token from .env file

    if(!githubToken){
     console.error('GITHUB_TOKEN is not set in .env file');
    }
    const OWNER = 'nikivakil';
    const REPO = '461-team';
    
    const fetchPullRequestCount = async() =>{
        try{
            //Make a GET request to the Github API
            const response = await axios.get(`https://api.github.com/repos/${OWNER}/${REPO}/pulls?state=all`, {
                headers: {
                    Authorization: `token ${githubToken}`
                }
            });
            console.log(response.data.length);
        } catch (error){
            console.error('Error fetching pull requests: ', error);
        }
    }
    fetchPullRequestCount();
}

test_API();
