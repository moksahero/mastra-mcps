import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createOpenAI } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { MCPClient } from "@mastra/mcp";
import { z } from "zod";
dotenv.config();

const schema = z.object({
  summary: z.string(),
  content: z.string(),
  keywords: z.array(z.string()),
});

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const mcp = new MCPClient({
    servers: {
      kokkai: {
        command: "npx",
        args: ["-y", "kokkai-meeting-mcp-server"],
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
        あなたは国会APIを使って日本の国会記録を検索する専門家です。
        ツールを使用する際は、常に見つけた内容について明確でテキストベースの応答を提供してください。
        特に求められない限り、構造化されたオブジェクトを返そうとしないでください。
        content は絶対に文字列で返してください。
        `,
        model: openai("gpt-4o-mini"),
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
