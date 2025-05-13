import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { MCPClient } from "@mastra/mcp";
import { z } from "zod";
dotenv.config();

const schema = z.object({
  summary: z.string(),
  content: z.string(),
});

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const mcp = new MCPClient({
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
        args: ["<absolute-path-to-project-folder>/build/index.js"],
      },
    },
  });

  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  app.post("/api/ask", async (req: Request, res: Response) => {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
    }

    try {
      const rawTools = await mcp.getTools();

      let wrappedTools = Object.fromEntries(
        Object.entries(rawTools).map(([name, tool]) => [
          name,
          {
            ...tool,
            execute: async (input: any) => {
              console.log(`🔧 [Tool: ${name}] Input:`, JSON.stringify(input));
              const result = await tool.execute(input);
              console.log(`✅ [Tool: ${name}] Output:`, result);
              return result;
            },
          },
        ])
      );

      const agent = new Agent({
        name: "Playwright Gcal Agent",
        tools: wrappedTools,
        instructions: `
        Playwrightを使ってURLを解析し、Perplexityで検索し、ユーザーの意図に合う最新の情報を収集します。
        
        ### ステップ指針：
        1. ユーザーの目的に応じて、必要であればPlaywrightで実際のページにアクセスして検証してください。
        2. Perplexityで情報を取得してください。
        3. 最終的に、得られたタイトルと内容を指定されたgoogleカレンダーのアカウントに登録してください
        

        出力：
        - リストアップしたデータを出力
        - 全部日本語
        `,
        model: openai("gpt-4.1-mini"),
      });

      const result = await agent.generate([{ role: "user", content: prompt }], {
        experimental_output: schema,
      });
      console.log(result.object);
      res.json(result.object);
    } catch (err) {
      res.json(err);
      console.error(err);
      res.status(500).json({ error: "Error generating response" });
    } finally {
      // 接続を明示的に終了
      console.log("Disconnecting from MCP...");
      await mcp.disconnect();
    }
  });

  app.listen(4000, () => {
    console.log("✅ Express API server is running on http://localhost:4000");
  });
}

// Call main()
main().catch((err) => {
  console.error("❌ Failed to start server:", err);
});
