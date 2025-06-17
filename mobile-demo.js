const express = require('express');
const path = require('path');
const app = express();
const port = 3002;

app.use(express.static('mobile-web-preview.html'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'mobile-web-preview.html'));
});

app.get('/mobile-preview', (req, res) => {
  res.sendFile(path.join(__dirname, 'mobile-web-preview.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`📱 Mobile Demo disponível em http://localhost:${port}`);
  console.log(`🔗 Acesse também: http://localhost:${port}/mobile-preview`);
});