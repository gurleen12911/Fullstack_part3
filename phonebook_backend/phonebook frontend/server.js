const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Create a reverse proxy to your local backend
app.use('/api', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));

// Serve the static files from your build directory
app.use(express.static('build'));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});
