import { useState, useEffect } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [displayedContent, setDisplayedContent] = useState("");
  const [loading, setLoading] = useState(false); // new loading state

  const submit = async () => {
    setLoading(true);
    setDisplayedContent("");
    setResponse(null);
    try {
      const res = await fetch("http://localhost:4000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResponse(data);
      setDisplayedContent(data.content); // ← ここで即表示
    } catch (err) {
      console.error("❌ Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!response?.content) return;
    setDisplayedContent(response.content); // 一括表示
  }, [response]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Mastra Prompt UI</h1>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        cols={50}
      />
      <br />
      <button onClick={submit} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
      {loading && <LoadingDots />}
      {response?.content && (
        <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
          {displayedContent}
        </pre>
      )}
    </div>
  );
}

const LoadingDots = () => {
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", marginLeft: 10 }}
    >
      <span style={dotStyle(0)}></span>
      <span style={dotStyle(1)}></span>
      <span style={dotStyle(2)}></span>
    </span>
  );
};

const dotStyle = (delayIndex: number): React.CSSProperties => ({
  width: 8,
  height: 8,
  margin: "0 3px",
  borderRadius: "50%",
  backgroundColor: "#666",
  animation: `bounce 1.4s infinite ease-in-out both`,
  animationDelay: `${delayIndex * 0.2}s`,
});

<style>
  {`
@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  40% {
    transform: scale(1.4);
    opacity: 1;
  }
}
`}
</style>;
