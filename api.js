#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const Wappalyzer = require('./driver');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Main analyze endpoint
app.post('/analyze', async (req, res) => {
  try {
    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const { hostname } = new URL(url);
      
      if (!hostname) {
        throw new Error('Invalid URL');
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Extract headers from request if provided
    const headers = options.headers || {};
    
    // Setup storage if provided
    const storage = {
      local: options.localStorage || {},
      session: options.sessionStorage || {},
    };

    // Configure wappalyzer options
    const wappalyzerOptions = {
      debug: options.debug || false,
      delay: options.delay || 500,
      maxUrls: options.maxUrls || 1,
      maxWait: options.maxWait || 10000,
      recursive: options.recursive || false,
      probe: options.probe || false,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      htmlMaxCols: options.htmlMaxCols,
      htmlMaxRows: options.htmlMaxRows,
      noScripts: options.noScripts || false,
      noRedirect: options.noRedirect || false,
    };

    // Initialize wappalyzer
    const wappalyzer = new Wappalyzer(wappalyzerOptions);

    await wappalyzer.init();

    // Start the analysis
    const site = await wappalyzer.open(url, headers, storage);
    
    const results = await site.analyze();
    
    // Clean up resources
    await wappalyzer.destroy();
    
    return res.json(results);
  } catch (error) {
    console.error('Analysis error:', error);
    
    return res.status(500).json({ 
      error: 'Analysis failed', 
      message: error.message || String(error) 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Wappalyzer API server running on port ${port}`);
}); 