#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const Wappalyzer = require('./driver');
const pc = require('picocolors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cultivate API',
      version: '1.0.0',
      description: 'API for analyzing technologies used on websites',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./api.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(cors());
app.use(express.json());

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 */
app.get('/health', (req, res) => {
  // Check if server is ready to accept requests
  if (!server.listening) {
    return res.status(503).json({ 
      status: 'Service Unavailable',
      message: 'Server is starting up or shutting down'
    });
  }
  
  res.status(200).json({ status: 'OK' });
  console.log(pc.green(`INFO`) + ` [${new Date().toISOString()}] (Cultivate API): Health check endpoint called`);
});

/**
 * @swagger
 * /analyze:
 *   post:
 *     summary: Analyze a website
 *     description: Analyzes the technologies used on a given website URL
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: The URL to analyze
 *               options:
 *                 type: object
 *                 description: Optional configuration parameters
 *                 required: false
 *                 properties:
 *                   debug:
 *                     type: boolean
 *                     description: Enable debug mode
 *                     default: false
 *                   delay:
 *                     type: number
 *                     description: Delay between actions in milliseconds
 *                     default: 500
 *                   maxUrls:
 *                     type: number
 *                     description: Maximum number of URLs to analyze
 *                     default: 1
 *                   maxWait:
 *                     type: number
 *                     description: Maximum time to wait for page load in milliseconds
 *                     default: 10000
 *                   recursive:
 *                     type: boolean
 *                     description: Enable recursive analysis
 *                     default: false
 *                   probe:
 *                     type: boolean
 *                     description: Enable probe mode
 *                     default: false
 *                   noScripts:
 *                     type: boolean
 *                     description: Disable JavaScript execution
 *                     default: false
 *                   noRedirect:
 *                     type: boolean
 *                     description: Disable following redirects
 *                     default: false
 *                   headers:
 *                     type: object
 *                     description: Custom headers to send with the request
 *                     default: {}
 *                   localStorage:
 *                     type: object
 *                     description: Local storage data to initialize
 *                     default: {}
 *                   sessionStorage:
 *                     type: object
 *                     description: Session storage data to initialize
 *                     default: {}
 *                   htmlMaxCols:
 *                     type: number
 *                     description: Maximum number of columns in HTML output
 *                   htmlMaxRows:
 *                     type: number
 *                     description: Maximum number of rows in HTML output
 *     responses:
 *       200:
 *         description: Successfully analyzed website
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Analysis results containing detected technologies
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "URL is required"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Analysis failed"
 *                 message:
 *                   type: string
 *                   example: "Connection timeout"
 */
// Main analyze endpoint
app.post('/analyze', async (req, res) => {
  let browser;
  try {
    console.log(pc.green(`INFO`) + ` [${new Date().toISOString()}] (Cultivate API): Analyzing URL: ${req.body.url}`);
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
    console.log(pc.green(`INFO`) + ` [${new Date().toISOString()}] (Cultivate API): Analysis complete for URL: ${url}`);
    return res.json(results);
  } catch (error) {
    console.error(pc.red(`ERROR`) + ` [${new Date().toISOString()}] (Cultivate API): Analysis error:`, error);
    
    // // Ensure cleanup even on error
    // if (browser) {
    //   try {
    //     await browser.close();
    //   } catch (closeError) {
    //     console.error(pc.red(`ERROR`) + ` [${new Date().toISOString()}] (Cultivate API): Error closing browser:`, closeError);
    //   }
    // }
    
    return res.status(500).json({ 
      error: 'Analysis failed', 
      message: error.message || String(error) 
    });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Cultivate API' });
});

// Start server
const server = app.listen(port, () => {
  console.log(pc.green(`INFO`) + ` [${new Date().toISOString()}] (Cultivate API): Server running on port ${port}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log(pc.yellow(`WARN`) + ` [${new Date().toISOString()}] (Cultivate API): SIGTERM received, shutting down gracefully`);
  server.close(async () => {
    console.log(pc.green(`INFO`) + ` [${new Date().toISOString()}] (Cultivate API): Server closed`);
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(pc.yellow(`WARN`) + ` [${new Date().toISOString()}] (Cultivate API): SIGINT received, shutting down gracefully`);
  server.close(async () => {
    console.log(pc.green(`INFO`) + ` [${new Date().toISOString()}] (Cultivate API): Server closed`);
    process.exit(0);
  });
}); 