// pending.js (Node.js server example)
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.get('/pending', (req, res) => {
  fs.readFile('./pending.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read pending file' });
    try {
      const submissions = JSON.parse(data);
      const pending = submissions.filter(s => s.status === 'pending');
      res.json(pending);
    } catch {
      res.status(500).json({ error: 'Invalid JSON data' });
    }
  });
});

app.listen(PORT, () => console.log(`Pending API running at http://localhost:${PORT}`));
