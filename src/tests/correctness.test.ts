// src/tests/correctness.test.ts

import axios from 'axios';
import { getToken } from '../url';
import {
    getIssues,
    getPullRequests,
    analyzeIssues,
    analyzePullRequests,
    analyzeRepo,
    get_responsiveness_metric
} from '../metrics/correctness';

jest.mock('axios');
jest.mock('../url', () => ({
    getToken: jest.fn()
}));

describe('GitHub API functions', () => {
    const mockToken = 'mockToken';
    const mockIssues = [
        { state: 'open', created_at: '2024-01-01T00:00:00Z', closed_at: '' },
        { state: 'closed', created_at: '2024-01-01T00:00:00Z', closed_at: '2024-01-02T00:00:00Z' }
    ];
    const mockPullRequests = [
        { state: 'open', created_at: '2024-01-01T00:00:00Z', closed_at: '' },
        { state: 'closed', created_at: '2024-01-01T00:00:00Z', closed_at: '2024-01-02T00:00:00Z' }
    ];

    beforeEach(() => {
        (getToken as jest.Mock).mockReturnValue(mockToken);
    });

    // test: fetches issues successfully
    it('fetches issues successfully', async () => {
        (axios.get as jest.Mock).mockResolvedValue({ data: mockIssues });
        
        const issues = await getIssues('owner', 'repo');
        expect(issues).toEqual(mockIssues);
        expect(axios.get).toHaveBeenCalledWith('https://api.github.com/repos/owner/repo/issues?state=all', {
            headers: { Authorization: `token ${mockToken}` }
        });
    });

    // test: handles error in getIssues
    it('handles error in getIssues', async () => {
        (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));
        
        await expect(getIssues('owner', 'repo')).rejects.toThrow('Network error');
    });

    // test: analyzes issues correctly
    it('analyzes issues correctly', () => {
        const analysis = analyzeIssues(mockIssues);
        expect(analysis).toEqual({
            totalIssues: 2,
            openIssues: 1,
            closedIssues: 1,
            avgTimeToClose: 24
        });
    });

    // test: analyzes pull requests correctly
    it('analyzes pull requests correctly', () => {
        const analysis = analyzePullRequests(mockPullRequests);
        expect(analysis).toEqual({
            totalPRs: 2,
            openPRs: 1,
            closedPRs: 1,
            avgTimeToClose: 24
        });
    });

    // test: analyzes repository correctly
    it('analyzes repository correctly', async () => {
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockIssues })
                              .mockResolvedValueOnce({ data: mockPullRequests });
        
        const analysis = await analyzeRepo('owner', 'repo');
        expect(analysis).toEqual({
            issueAnalysis: {
                totalIssues: 2,
                openIssues: 1,
                closedIssues: 1,
                avgTimeToClose: 24
            },
            prAnalysis: {
                totalPRs: 2,
                openPRs: 1,
                closedPRs: 1,
                avgTimeToClose: 24
            }
        });
    });

    // test: calculates responsiveness metric correctly
    it('calculates responsiveness metric correctly', async () => {
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockIssues })
                              .mockResolvedValueOnce({ data: mockPullRequests });
        
        const score = await get_responsiveness_metric('https://github.com/owner/repo');
        expect(score).toBeCloseTo(1 - 24 / 100); // Assuming maxTimeToClose is 100
    });

    // test: handles error in get_responsiveness_metric
    it('handles error in get_responsiveness_metric', async () => {
        (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Issues fetch error'))
                               .mockRejectedValueOnce(new Error('Pull requests fetch error'));
        
        await expect(get_responsiveness_metric('https://github.com/owner/repo')).rejects.toThrow('Issues fetch error');
    });
});