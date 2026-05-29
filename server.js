const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets from public/ folder
app.use(express.static(path.join(__dirname, 'public')));

// Connect API routes
app.use('/api', apiRoutes);

// Fallback to index.html for single page layout routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start listening
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` GourmetExpress server is running!`);
    console.log(` Access link: http://localhost:${PORT}`);
    console.log(` Environment: Production-ready Node backend`);
    console.log(`==================================================`);
});
