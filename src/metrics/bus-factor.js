"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_bus_factor = get_bus_factor;
var axios_1 = require("axios");
var url_1 = require("../url"); // Import the function to get GitHub token
/**
 * Fetches the commit history for a GitHub repository.
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @returns The list of commits.
 */
function getCommits(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var token, apiUrl, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = (0, url_1.getToken)();
                    apiUrl = "https://api.github.com/repos/".concat(owner, "/").concat(repo, "/commits");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(apiUrl, {
                            headers: {
                                Authorization: "token ".concat(token) // Include token in the request header for authorization
                            }
                        })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data]; // Return the list of commits
                case 3:
                    error_1 = _a.sent();
                    console.error('Error fetching commits:', error_1); // Log any error that occurs
                    throw error_1; // Rethrow the error for further handling
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches contributor stats for a GitHub repository.
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @returns The list of contributors.
 */
function getContributors(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var token, apiUrl, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = (0, url_1.getToken)();
                    apiUrl = "https://api.github.com/repos/".concat(owner, "/").concat(repo, "/contributors");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(apiUrl, {
                            headers: {
                                Authorization: "token ".concat(token) // Include token in the request header for authorization
                            }
                        })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data]; // Return the list of contributors
                case 3:
                    error_2 = _a.sent();
                    console.error('Error fetching contributors:', error_2); // Log any error that occurs
                    throw error_2; // Rethrow the error for further handling
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Analyzes the contribution distribution based on commits and contributors.
 * @param commits - The list of commits.
 * @param contributors - The list of contributors.
 * @returns An object with analysis results.
 */
function analyzeContributionDistribution(commits, contributors) {
    var commitCounts = {}; // Initialize an object to track commits per author
    // Count the number of commits per author
    commits.forEach(function (commit) {
        var author = commit.commit.author.name; // Get the author of the commit
        commitCounts[author] = (commitCounts[author] || 0) + 1; // Increment the commit count for the author
    });
    var totalCommits = commits.length; // Total number of commits
    var totalContributors = contributors.length; // Total number of contributors
    var distribution = Object.values(commitCounts); // Array of commit counts per author
    var maxCommits = Math.max.apply(Math, __spreadArray(__spreadArray([], distribution, false), [1], false)); // Find the maximum number of commits by a single author (avoid division by zero)
    // Calculate the bus factor
    var accumulatedCommits = 0;
    var busFactor = 0;
    // Sort authors by number of commits in descending order
    for (var _i = 0, _a = distribution.sort(function (a, b) { return b - a; }); _i < _a.length; _i++) {
        var count = _a[_i];
        accumulatedCommits += count; // Accumulate the number of commits
        busFactor += 1; // Count the number of top contributors
        if (accumulatedCommits >= totalCommits / 2)
            break; // Stop when half of the commits are accounted for
    }
    return {
        totalCommits: totalCommits,
        totalContributors: totalContributors,
        maxCommits: maxCommits,
        busFactor: busFactor // Number of contributors needed to reach half of the total commits
    };
}
/**
 * Gets the bus factor metric for a GitHub repository.
 * @param repoUrl - The URL of the GitHub repository.
 * @returns An object with contribution distribution analysis.
 */
function get_bus_factor(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, owner, repo, _b, commits, contributors, analysis, error_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    _a = parseRepoUrl(repoUrl), owner = _a.owner, repo = _a.repo;
                    return [4 /*yield*/, Promise.all([
                            getCommits(owner, repo),
                            getContributors(owner, repo)
                        ])];
                case 1:
                    _b = _c.sent(), commits = _b[0], contributors = _b[1];
                    analysis = analyzeContributionDistribution(commits, contributors);
                    return [2 /*return*/, analysis]; // Return the analysis results
                case 2:
                    error_3 = _c.sent();
                    console.error('Error calculating bus factor:', error_3); // Log any error that occurs
                    throw error_3; // Rethrow the error for further handling
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Extracts owner and repo from a GitHub repository URL.
 * @param url - The GitHub repository URL.
 * @returns An object with owner and repo.
 */
function parseRepoUrl(url) {
    var match = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/); // Regex to parse the owner and repo from the URL
    if (!match)
        throw new Error('Invalid GitHub URL'); // Throw error if URL does not match the expected format
    return { owner: match[1], repo: match[2] }; // Return the extracted owner and repo
}
// Usage example
var REPO_URL = 'https://github.com/nikivakil/461-team'; // Example repository URL
get_bus_factor(REPO_URL)
    .then(function (analysis) {
    console.log('Bus Factor Analysis:', analysis); // Log the analysis results
})
    .catch(function (error) {
    console.error('Error:', error.message); // Log any error that occurs
});
