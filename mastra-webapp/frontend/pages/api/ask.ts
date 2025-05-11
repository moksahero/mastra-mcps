export default async function handler(req, res) {
  const result = await fetch('http://localhost:4000/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  const data = await result.json();
  res.status(200).json(data);
}
