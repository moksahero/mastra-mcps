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
  sql: z.union([z.string(), z.array(z.string())]),
});

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const mcp = new MCPClient({
    servers: {
      postgres: {
        command: "npx",
        args: [
          "-y",
          "@modelcontextprotocol/server-postgres",
          "postgres://postgres:postgres@localhost:5432/employee",
        ],
      },
    },
  });

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const agent = new Agent({
    name: "Postgres Agent",
    tools: await mcp.getTools(),
    instructions: `
  あなたはPostgresのデータベースに接続して、SQLクエリを実行するエージェントです。
  employeeデータベースの中のテーブルの関係を理解しておいてください。
  employeeデータベースの中にはpersonとjobテーブルしかありません。
  SQLを生成し、必ずその結果を本文（content）に詳しく日本語で含めてください。
  出力には summary、content（人間が読む用の自然文）、keywords（重要語）、sql（実行したすべてのSQL）の4つを含めてください。
  content にはクエリ結果の要素を実際に列挙してください（例：名前の一覧を含めてください）。
  必ずpersonとjobテーブルを先に読みに行って、存在するカラムだけでSQLクエリを生成してください。
  複数のSQLが必要な場合は、すべてのSQLを配列形式で出力してください。
  例: ['SELECT ...', 'JOIN ...'] のようにsqlフィールドには配列を返してください。
  出力は全部日本語でお願いします。
  `,
    model: openai("gpt-4o"),
  });

  app.post("/api/ask", async (req: Request, res: Response) => {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
    }

    try {
      const result = await agent.generate([{ role: "user", content: prompt }], {
        experimental_output: schema,
      });
      console.log(result.object);
      res.json(result.object);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error generating response" });
    }

    res.json({ message: "Hello" });
  });

  app.listen(4000, () => {
    console.log("✅ Express API server is running on http://localhost:4000");
  });
}

// Call main()
main().catch((err) => {
  console.error("❌ Failed to start server:", err);
});
