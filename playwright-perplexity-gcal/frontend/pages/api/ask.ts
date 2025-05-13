export default async function handler(req, res) {
  try {
    const result = await fetch("http://localhost:4000/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await result.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
