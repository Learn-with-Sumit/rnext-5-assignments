require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4020;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`📚 BookShelf API Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📖 Docs & Endpoints: http://localhost:${PORT}/api/books`);
  console.log(`=========================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});
