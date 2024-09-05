import dotenv from 'dotenv';


export function test_API(){
    const githubToken = process.env.GITHUB_TOKEN; //get token from .env file

    if(!githubToken){
     console.error('GITHUB_TOKEN is not set in .env file');
    }
}

