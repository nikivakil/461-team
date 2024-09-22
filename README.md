# 461-team
Alex Pienkowski  
Aryana Lynch
Niki Vakil
Shaan Chanchani

# Files
### src/index.ts
Command-Line Program Setup:
Uses the commander package to create CLI commands and arguments.
Main command processes a file containing URLs, analyzing the repositories based on predefined metrics.
Includes an optional test command to run test suites using jest.

Metrics Calculation:
Metrics include NetScore, Ramp-Up Time, Correctness, Bus Factor, License Compatibility, and Responsiveness.
For each URL, the tool fetches or calculates these metrics using imported functions like get_bus_factor, getCorrectnessMetric, etc.

Repository Cloning:
If the URL is for a GitHub repo, the tool clones it locally to gather data for metrics.
For NPM package URLs, it attempts to extract the corresponding GitHub repository.

Output:
Outputs the metrics as a JSON object with calculated scores and latencies for each URL in the file.
Handles errors gracefully by returning an empty result for failed URLs.

### src/url.ts
Environment Setup:
Uses dotenv to load environment variables, including the GitHub API token.

GitHub API Functions:
Fetches repository data, including the number of open/closed pull requests, issues, and commits.
Retrieves and decodes the README file content from a repository.
Calculates average closure time and response time for pull requests and issues.
Retrieves commit history and contributors.

NPM Package Functions:
Fetches GitHub URLs from NPM package data by querying the NPM registry.

Utility Functions:
classifyURL: Classifies URLs as GitHub, NPM, or other.
getToken: Retrieves the GitHub API token from environment variables.
Provides helper functions for constructing Axios request headers and extracting information from URLs.

Logging:
Uses a logger for detailed logging of each action, including errors, warnings, and debugging information.

### src/logger.ts
Environment Setup:
Loads environment variables from a .env file using dotenv.
Retrieves log level (LOG_LEVEL) and log file path (LOG_FILE) from environment variables, with default values if they're not set.

Log Directory Creation:
Ensures that the directory for logs exists. If not, it creates the directory using Node's fs module.

Logger Configuration:
Creates a logger using winston, configured with:
A log level (e.g., info, error) determined by the environment variable.
Formats for log output: timestamps, error stack traces, and JSON formatting.
Two transport mechanisms:
Logs of level info and below are written to the main log file (package-evaluator.log).
Logs of level error are written to a separate error.log file.

Export:
The logger is exported for use in other parts of the application.

### src/metrics/bus-factor.ts

### src/metrics/correctness.ts

### src/metrics/license-compatibility.ts

### src/metrics/ramp-up-time.ts

### src/metrics/responsiveness.ts

### src/tests/bus-factor-test.ts

### src/tests/correctness-test.ts

### src/tests/url-test.ts

## License
MIT
