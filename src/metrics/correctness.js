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
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeRepo = analyzeRepo;
exports.get_responsiveness_metric = get_responsiveness_metric;
var axios_1 = require("axios");
var url_1 = require("../url"); // Assuming getToken is imported from url.ts
/**
 * Fetches the issues for a GitHub repository.
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @returns The list of issues.
 */
function getIssues(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var token, apiUrl, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = (0, url_1.getToken)();
                    apiUrl = "https://api.github.com/repos/".concat(owner, "/").concat(repo, "/issues?state=all");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(apiUrl, {
                            headers: {
                                Authorization: "token ".concat(token)
                            }
                        })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data]; // returns list of issues
                case 3:
                    error_1 = _a.sent();
                    console.error('Error fetching issues:', error_1);
                    throw error_1; // or returns error
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Analyzes issues by counting open and closed ones.
 * @param issues - The list of issues.
 * @returns An object with analysis results.
 */
function analyzeIssues(issues) {
    var openIssues = issues.filter(function (issue) { return issue.state === 'open'; }); // counts open issues
    var closedIssues = issues.filter(function (issue) { return issue.state === 'closed'; }); // counts closed issues
    // Time to close (for closed issues)
    var closeTimes = closedIssues.map(function (issue) {
        var createdAt = new Date(issue.created_at).getTime();
        var closedAt = new Date(issue.closed_at).getTime();
        return (closedAt - createdAt) / (1000 * 60 * 60); // time in hours
    });
    var avgTimeToClose = closeTimes.length > 0 ?
        (closeTimes.reduce(function (a, b) { return a + b; }, 0) / closeTimes.length) : 0;
    return {
        totalIssues: issues.length,
        openIssues: openIssues.length,
        closedIssues: closedIssues.length,
        avgTimeToClose: avgTimeToClose
    };
}
/**
 * Fetches the pull requests for a GitHub repository.
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @returns The list of pull requests.
 */
function getPullRequests(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var token, apiUrl, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = (0, url_1.getToken)();
                    apiUrl = "https://api.github.com/repos/".concat(owner, "/").concat(repo, "/pulls?state=all");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(apiUrl, {
                            headers: {
                                Authorization: "token ".concat(token)
                            }
                        })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data]; // returns list of pull requests
                case 3:
                    error_2 = _a.sent();
                    console.error('Error fetching pull requests:', error_2);
                    throw error_2; // or returns error
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Analyzes pull requests by counting open, closed, and merged ones.
 * @param pullRequests - The list of pull requests.
 * @returns An object with analysis results.
 */
function analyzePullRequests(pullRequests) {
    var openPRs = pullRequests.filter(function (pr) { return pr.state === 'open'; }); // counts open pull requests
    var closedPRs = pullRequests.filter(function (pr) { return pr.state === 'closed'; }); // counts closed pull requests
    // Time to close (for closed PRs)
    var closeTimes = closedPRs.map(function (pr) {
        var createdAt = new Date(pr.created_at).getTime();
        var closedAt = new Date(pr.closed_at).getTime();
        return (closedAt - createdAt) / (1000 * 60 * 60); // time in hours
    });
    var avgTimeToClose = closeTimes.length > 0 ?
        (closeTimes.reduce(function (a, b) { return a + b; }, 0) / closeTimes.length) : 0;
    return {
        totalPRs: pullRequests.length,
        openPRs: openPRs.length,
        closedPRs: closedPRs.length,
        avgTimeToClose: avgTimeToClose
    };
}
/**
 * Analyzes the issues and pull requests of a GitHub repository.
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @returns A combined analysis of issues and pull requests.
 */
function analyzeRepo(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, issues, pullRequests, issueAnalysis, prAnalysis, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all([
                            getIssues(owner, repo),
                            getPullRequests(owner, repo)
                        ])];
                case 1:
                    _a = _b.sent(), issues = _a[0], pullRequests = _a[1];
                    issueAnalysis = analyzeIssues(issues);
                    prAnalysis = analyzePullRequests(pullRequests);
                    return [2 /*return*/, {
                            issueAnalysis: issueAnalysis,
                            prAnalysis: prAnalysis
                        }];
                case 2:
                    error_3 = _b.sent();
                    console.error('Error analyzing repository:', error_3);
                    throw error_3;
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
    var match = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/);
    if (!match)
        throw new Error('Invalid GitHub URL');
    return { owner: match[1], repo: match[2] };
}
/**
 * Gets the responsiveness metric for a GitHub repository.
 * @param repoUrl - The URL of the GitHub repository.
 * @returns A score between 0 and 1 representing responsiveness.
 */
function get_responsiveness_metric(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, owner, repo, _b, issues, pullRequests, issueAnalysis, prAnalysis, avgTimeToClose, maxTimeToClose, score, error_4;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    _a = parseRepoUrl(repoUrl), owner = _a.owner, repo = _a.repo;
                    return [4 /*yield*/, Promise.all([
                            getIssues(owner, repo),
                            getPullRequests(owner, repo)
                        ])];
                case 1:
                    _b = _c.sent(), issues = _b[0], pullRequests = _b[1];
                    issueAnalysis = analyzeIssues(issues);
                    prAnalysis = analyzePullRequests(pullRequests);
                    avgTimeToClose = (issueAnalysis.avgTimeToClose + prAnalysis.avgTimeToClose) / 2;
                    maxTimeToClose = 100;
                    score = Math.max(0, 1 - avgTimeToClose / maxTimeToClose);
                    return [2 /*return*/, score];
                case 2:
                    error_4 = _c.sent();
                    console.error('Error calculating responsiveness metric:', error_4);
                    throw error_4;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Usage example
var REPO_URL = 'https://github.com/nikivakil/461-team';
get_responsiveness_metric(REPO_URL)
    .then(function (score) {
    console.log('Responsiveness Score:', score);
})
    .catch(function (error) {
    console.error('Error:', error.message);
});
