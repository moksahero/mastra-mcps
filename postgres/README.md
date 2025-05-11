# 🕸️ Playwright MCP + OpenAI Browser Agent

このプロジェクトは、[Mastra](https://github.com/mastra-ai/mastra) を使って Playwright MCP 経由でウェブページを操作・解析し、OpenAI の LLM（GPT-4 など）でページ内容を処理・要約するブラウザエージェントのサンプルです。  
同じページを再解析しないよう、**HTML + プロンプトに基づくキャッシュ機構**を搭載しています。

---

## 🛠️ 機能

- ✅ プロンプトから自然言語で web サイトを操作できる
- ✅ テストシナリオの入った Gherkin ファイルも入力可
- ✅ ローカルの @playwright/mcp を使うようになっていて、ローカルでブラウザが開くのが確認できる

---

## 🚀 セットアップ

### 1. インストール

```bash
pnpm install
# または
npm install
```

### 2. 起動

```bash
npx tsx src/index.ts
```
