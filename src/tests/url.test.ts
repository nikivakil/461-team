import { getToken, parseGitHubUrl, getOpenPRs, getClosedPRs, classifyURL, UrlType } from '../url';
import axios from 'axios';
import logger from '../logger';

// Mocking dotenv.config to prevent loading actual environment variables
jest.mock('dotenv', () => ({
    config: jest.fn(),
}));

// Mocking axios to prevent real API calls
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mocking logger to capture logs
jest.mock('../logger');
const mockedLogger = logger as jest.Mocked<typeof logger>;

describe('Test GitHub utility functions', () => {
    // Test for getToken
    it('should return the GitHub token from environment variables', () => {
        process.env.GITHUB_TOKEN = 'test_token';

        const token = getToken();
        expect(token).toBe('test_token');
    });

    it('should log an error if the token is not set', () => {
        mockedLogger.error = jest.fn();

        delete process.env.GITHUB_TOKEN;  // Removing the token
        const token = getToken();

        expect(token).toBeUndefined();
        expect(mockedLogger.error).toHaveBeenCalledWith('GITHUB_TOKEN is not set in .env file');
    });

    // Test for classifyURL
    it('should classify GitHub URLs correctly', () => {
        const githubUrl = 'https://github.com/user/repo';
        const npmUrl = 'https://www.npmjs.com/package/some-package';
        const otherUrl = 'https://example.com';

        expect(classifyURL(githubUrl)).toBe(UrlType.GitHub);
        expect(classifyURL(npmUrl)).toBe(UrlType.NPM);
        expect(classifyURL(otherUrl)).toBe(UrlType.Other);
    });

    // Test for parseGitHubUrl
    it('should correctly parse GitHub URLs', () => {
        const url = 'https://github.com/user/repo';
        const { owner, repo } = parseGitHubUrl(url);

        expect(owner).toBe('user');
        expect(repo).toBe('repo');
    });

    it('should return empty strings if the URL is invalid', () => {
        const url = 'https://invalid-url.com';
        const { owner, repo } = parseGitHubUrl(url);

        expect(owner).toBe('');
        expect(repo).toBe('');
    });
});

// Tests for API functions with mocked axios
describe('Test API functions', () => {
    it('should fetch open PRs count', async () => {
        mockedAxios.get.mockResolvedValue({ data: [1, 2, 3] });

        const headers = { Authorization: 'token test_token' };
        const openPRs = await getOpenPRs('owner', 'repo', headers);

        expect(mockedAxios.get).toHaveBeenCalledWith('https://api.github.com/repos/owner/repo/pulls?state=open', { headers });
        expect(openPRs).toBe(3);  // Mocked response has 3 open PRs
    });

    it('should fetch closed PRs count', async () => {
        mockedAxios.get.mockResolvedValue({ data: [1, 2] });

        const headers = { Authorization: 'token test_token' };
        const closedPRs = await getClosedPRs('owner', 'repo', headers);

        expect(mockedAxios.get).toHaveBeenCalledWith('https://api.github.com/repos/owner/repo/pulls?state=closed', { headers });
        expect(closedPRs).toBe(2);  // Mocked response has 2 closed PRs
    });
});
