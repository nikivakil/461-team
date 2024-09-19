import logger from '../logger';
import { getCorrectnessMetric } from '../metrics/correctness';
import * as url from '../url';

// Mock the functions that make API calls
jest.mock('../url', () => ({
    getToken: jest.fn(),
    get_axios_params: jest.fn(),
    getOpenIssues: jest.fn(),
    getClosedIssues: jest.fn(),
    getOpenPRs: jest.fn(),
    getClosedPRs: jest.fn(),
}));

// Mock the logger
jest.mock('../logger', () => ({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),  // Use a simple mock implementation
}));

describe('Test getCorrectnessMetric', () => {
    const mockGitHubUrl = 'https://github.com/nikivakil/461-team';
    const mockToken = 'mocked_token';
    const mockOwner = 'nikivakil';
    const mockRepo = '461-team';
    const mockHeaders = { Authorization: `token ${mockToken}` };

    beforeEach(() => {
        jest.clearAllMocks();

        // Mocking the token and axios parameters
        (url.getToken as jest.Mock).mockReturnValue(mockToken);
        (url.get_axios_params as jest.Mock).mockReturnValue({ owner: mockOwner, repo: mockRepo, headers: mockHeaders });
    });

    it('should handle errors and return 0 on failure', async () => {
        // Mock logger.error
        const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {
            // Do nothing here
            return logger;  // Return logger instance if it's expected
        });
    
        // Mock API calls to throw an error
        (url.getOpenIssues as jest.Mock).mockRejectedValue(new Error('Error calculating correctness metric'));
    
       // console.log('Before calling getCorrectnessMetric');
        const result = await getCorrectnessMetric(mockGitHubUrl);
    
       // console.log('Result:', result);
       // console.log('Logger Error Calls:', loggerErrorSpy.mock.calls);
    
        expect(result).toEqual({
            score: 0,
            latency: expect.any(Number),
        });
    
        // Check the actual logged error message and metadata
        expect(loggerErrorSpy).toHaveBeenCalledWith(
            'Error calculating correctness metric',
            { error: 'Error calculating correctness metric', url: mockGitHubUrl }
        );
    
        loggerErrorSpy.mockRestore();
    });
    
});
