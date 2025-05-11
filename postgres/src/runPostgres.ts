import { createOpenAI } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import dotenv from "dotenv";
import { MCPClient } from "@mastra/mcp";
import readline from "readline";
import { z } from "zod";
dotenv.config();

// MCPの設定
export const mcp = new MCPClient({
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

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 環境変数からAPIキーを取得
});

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

// 1行入力でプロンプトを受け取る
async function readPrompt(): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("📥 プロンプトを入力してください:> ", (input) => {
      rl.close();
      resolve(input);
    });
  });
}

async function readMultiLinePrompt(): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("📥 プロンプトを入力してください（空行で終了）:");

    const lines: string[] = [];

    rl.on("line", (line) => {
      if (line.trim() === "") {
        rl.close();
        resolve(lines.join("\n"));
      } else {
        lines.push(line);
      }
    });
  });
}

const schema = z.object({
  summary: z.string(),
  content: z.string(),
  keywords: z.array(z.string()),
  sql: z.union([
    z.string(), // 旧形式（単一のSQL）
    z.array(z.string()), // 複数のSQL
  ]),
});

async function main() {
  const prompt = await readPrompt();

  try {
    const result = await agent.generate(
      [
        {
          role: "user",
          content: prompt,
        },
      ],
      {
        experimental_output: schema,
      }
    );

    console.log("✅ 出力:", result.object);
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
  } finally {
    // 接続を明示的に終了
    await mcp.disconnect();
  }
}

main();
