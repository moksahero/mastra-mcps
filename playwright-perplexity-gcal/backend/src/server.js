"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var express_1 = require("express");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var openai_1 = require("@ai-sdk/openai");
var google_1 = require("@ai-sdk/google");
var agent_1 = require("@mastra/core/agent");
var mcp_1 = require("@mastra/mcp");
var zod_1 = require("zod");
dotenv_1.default.config();
var schema = zod_1.z.object({
    summary: zod_1.z.string(),
    content: zod_1.z.string(),
});
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var app, mcp, openai, google;
        var _this = this;
        return __generator(this, function (_a) {
            app = (0, express_1.default)();
            app.use((0, cors_1.default)());
            app.use(express_1.default.json());
            mcp = new mcp_1.MCPClient({
                servers: {
                    playwright: {
                        //url: new URL("http://localhost:8931/sse"),
                        command: "npx",
                        args: ["@playwright/mcp"],
                    },
                    "perplexity-ask": {
                        command: "npx",
                        args: ["-y", "server-perplexity-ask"],
                        env: {
                            PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
                        },
                    },
                    "google-calendar": {
                        command: "node",
                        args: ["/home/ta/mastra/google-calendar-mcp/build/index.js"],
                    },
                },
            });
            openai = (0, openai_1.createOpenAI)({
                apiKey: process.env.OPENAI_API_KEY,
            });
            google = (0, google_1.createGoogleGenerativeAI)({
                apiKey: process.env.GOOGLE_API_KEY,
            });
            app.post("/api/ask", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var prompt, rawTools, wrappedTools, agent, result, err_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            prompt = req.body.prompt;
                            if (!prompt) {
                                res.status(400).json({ error: "Prompt is required" });
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, 5, 7]);
                            return [4 /*yield*/, mcp.getTools()];
                        case 2:
                            rawTools = _a.sent();
                            wrappedTools = Object.fromEntries(Object.entries(rawTools).map(function (_a) {
                                var name = _a[0], tool = _a[1];
                                return [
                                    name,
                                    __assign(__assign({}, tool), { execute: function (input) { return __awaiter(_this, void 0, void 0, function () {
                                            var result;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        console.log("\uD83D\uDD27 [Tool: ".concat(name, "] Input:"), JSON.stringify(input));
                                                        return [4 /*yield*/, tool.execute(input)];
                                                    case 1:
                                                        result = _a.sent();
                                                        console.log("\u2705 [Tool: ".concat(name, "] Output:"), result);
                                                        return [2 /*return*/, result];
                                                }
                                            });
                                        }); } }),
                                ];
                            }));
                            agent = new agent_1.Agent({
                                name: "Playwright Gcal Agent",
                                tools: wrappedTools,
                                instructions: "\n        Playwright\u3092\u4F7F\u3063\u3066URL\u3092\u89E3\u6790\u3057\u3001Perplexity\u3067\u691C\u7D22\u3057\u3001\u30E6\u30FC\u30B6\u30FC\u306E\u610F\u56F3\u306B\u5408\u3046\u6700\u65B0\u306E\u60C5\u5831\u3092\u53CE\u96C6\u3057\u307E\u3059\u3002\n        \n        ### \u30B9\u30C6\u30C3\u30D7\u6307\u91DD\uFF1A\n        1. \u30E6\u30FC\u30B6\u30FC\u306E\u76EE\u7684\u306B\u5FDC\u3058\u3066\u3001\u5FC5\u8981\u3067\u3042\u308C\u3070Playwright\u3067\u5B9F\u969B\u306E\u30DA\u30FC\u30B8\u306B\u30A2\u30AF\u30BB\u30B9\u3057\u3066\u691C\u8A3C\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n        2. Perplexity\u3067\u60C5\u5831\u3092\u53D6\u5F97\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n        3. \u6700\u7D42\u7684\u306B\u3001\u5F97\u3089\u308C\u305F\u30BF\u30A4\u30C8\u30EB\u3068\u5185\u5BB9\u3092\u6307\u5B9A\u3055\u308C\u305Fgoogle\u30AB\u30EC\u30F3\u30C0\u30FC\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u306B\u767B\u9332\u3057\u3066\u304F\u3060\u3055\u3044\n        \n\n        \u51FA\u529B\uFF1A\n        - \u30EA\u30B9\u30C8\u30A2\u30C3\u30D7\u3057\u305F\u30C7\u30FC\u30BF\u3092\u51FA\u529B\n        - \u5168\u90E8\u65E5\u672C\u8A9E\n        ",
                                model: openai("gpt-4.1-mini"),
                            });
                            return [4 /*yield*/, agent.generate([{ role: "user", content: prompt }], {
                                    experimental_output: schema,
                                })];
                        case 3:
                            result = _a.sent();
                            console.log(result.object);
                            res.json(result.object);
                            return [3 /*break*/, 7];
                        case 4:
                            err_1 = _a.sent();
                            res.json(err_1);
                            console.error(err_1);
                            res.status(500).json({ error: "Error generating response" });
                            return [3 /*break*/, 7];
                        case 5:
                            // 接続を明示的に終了
                            console.log("Disconnecting from MCP...");
                            return [4 /*yield*/, mcp.disconnect()];
                        case 6:
                            _a.sent();
                            return [7 /*endfinally*/];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            app.listen(4000, function () {
                console.log("✅ Express API server is running on http://localhost:4000");
            });
            return [2 /*return*/];
        });
    });
}
// Call main()
main().catch(function (err) {
    console.error("❌ Failed to start server:", err);
});
