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
exports.getToken = getToken;
exports.test_API = test_API;
exports.getReadmeContent = getReadmeContent;
exports.test_getReadmeContent = test_getReadmeContent;
var dotenv = require("dotenv");
var axios_1 = require("axios");
dotenv.config();
/**
 * Returns the GitHub token from the .env file.
 *
 * @returns {string} - The GitHub token.
 */
function getToken() {
    var githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
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
function test_API() {
    var _this = this;
    var githubToken = getToken();
    var OWNER = 'nikivakil';
    var REPO = '461-team';
    var getPullRequestCount = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get("https://api.github.com/repos/".concat(OWNER, "/").concat(REPO, "/pulls?state=all"), {
                            headers: {
                                Authorization: "token ".concat(githubToken)
                            }
                        })];
                case 1:
                    response = _a.sent();
                    // Log the number of pull requests in the console
                    console.log(response.data.length);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching pull requests: ', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    getPullRequestCount();
}
/**
 * Fetches the content of the README file from a GitHub repository.
 *
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @returns {Promise<string>} - A promise that resolves to the content of the README file.
 * @throws {Error} - Throws an error if the request fails or the README file is not found.
 */
function getReadmeContent(owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        var token, apiUrl, headers, response, readmeFile, readmeResponse, decodedContent, error_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    token = getToken();
                    apiUrl = "https://api.github.com/repos/".concat(owner, "/").concat(repo, "/contents");
                    headers = {
                        'Authorization': "token ".concat(token),
                        'Accept': 'application/vnd.github.v3+json'
                    };
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, axios_1.default.get(apiUrl, { headers: headers })];
                case 2:
                    response = _c.sent();
                    readmeFile = response.data.find(function (file) { return file.name.toLowerCase().startsWith('readme'); });
                    if (!readmeFile) {
                        throw new Error('README file not found');
                    }
                    return [4 /*yield*/, axios_1.default.get(readmeFile.url, { headers: headers })];
                case 3:
                    readmeResponse = _c.sent();
                    decodedContent = Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8');
                    return [2 /*return*/, decodedContent];
                case 4:
                    error_2 = _c.sent();
                    if (axios_1.default.isAxiosError(error_2)) {
                        throw new Error("API request failed: ".concat((_a = error_2.response) === null || _a === void 0 ? void 0 : _a.status, " ").concat((_b = error_2.response) === null || _b === void 0 ? void 0 : _b.statusText));
                    }
                    throw error_2;
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Usage example for getReadmeContent
function test_getReadmeContent() {
    var OWNER = 'nikivakil';
    var REPO = '461-team';
    getReadmeContent(OWNER, REPO)
        .then(function (readmeContent) { return console.log(readmeContent); })
        .catch(function (error) { return console.error('Error:', error.message); });
}
