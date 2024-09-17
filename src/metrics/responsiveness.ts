import * as dotenv from 'dotenv';
import * as url_t from '../url';

dotenv.config();


function normalize(closureTime: number, responseTime: number): number {
    // Ensure min and max are not the same to avoid division by zero
    const maxTimeToClose = 5 * 24; // max time for normalization in hours (5 days)
    const maxTimeToRespond = 36; // max time for response to pull request in hours (1.5 days)
    const closure_score = Math.max(0, 1 - closureTime / maxTimeToClose);
    const response_score = Math.max(0, 1 - responseTime / maxTimeToRespond);
    const responsiveness = (0.6 * response_score) + (0.4 * closure_score);
    return responsiveness;
}

export function getTimeDifferenceInHours(start: string, end: string): number{ //function to calculate the time difference in hours
    const startTime = new Date(start);
    const endTime = new Date(end);
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
}

export async function calculateResponsiveness(url:string, token: string){
    const {owner, repo, headers} = url_t.get_axios_params(url,token);
    console.log(owner, repo, headers);

    const averageClosureTime = await url_t.get_avg_ClosureTime(owner, repo, headers);
    const averageResponseTime = await url_t.get_avg_Responsetime(owner, repo, headers);

    const closureTime = averageClosureTime ?? 0; //if averageClosureTime is null, set it to 0
    const responseTime = averageResponseTime ?? 0; //if averageResponseTime is null, set it to 0

    if(closureTime === 0 && responseTime === 0){
        console.log("No issues or pull requests found");
        return 0;
    }

    const responsiveness = normalize(closureTime, responseTime);

    console.log(responsiveness);
    return responsiveness;
}

//