# Wappalyzer API

A RESTful API for Wappalyzer that identifies technologies used on websites using Puppeteer to mimic browser behavior.

## Installation

```bash
# Install dependencies
npm install

# Start the server
npm start

# Start in development mode (with auto-restart)
npm run dev
```

## API Endpoints

### Health Check

```
GET /health
```

Returns the status of the API server.

#### Response

```json
{
  "status": "OK"
}
```

### Analyze Website

```
POST /analyze
```

Analyzes a website and returns detected technologies.

#### Request Body

```json
{
  "url": "https://example.com",
  "options": {
    "debug": false,
    "delay": 500,
    "maxUrls": 1,
    "maxWait": 10000,
    "recursive": false,
    "probe": false,
    "userAgent": "Wappalyzer",
    "headers": {
      "Cookie": "example=value"
    },
    "localStorage": {
      "key": "value"
    },
    "sessionStorage": {
      "key": "value"
    },
    "htmlMaxCols": 2000,
    "htmlMaxRows": 3000,
    "noScripts": false,
    "noRedirect": false
  }
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| url | String | **Required.** The URL to analyze |
| options | Object | Optional configuration |
| options.debug | Boolean | Enable debug mode |
| options.delay | Number | Wait time between requests (ms) |
| options.maxUrls | Number | Maximum number of URLs to analyze |
| options.maxWait | Number | Maximum wait time for page resources (ms) |
| options.recursive | Boolean | Follow links on pages (crawler mode) |
| options.probe | Boolean | Perform deeper scan with additional requests |
| options.userAgent | String | Custom user agent string |
| options.headers | Object | Custom HTTP headers |
| options.localStorage | Object | Local storage data |
| options.sessionStorage | Object | Session storage data |
| options.htmlMaxCols | Number | Limit HTML characters per line processed |
| options.htmlMaxRows | Number | Limit HTML lines processed |
| options.noScripts | Boolean | Disable JavaScript on web pages |
| options.noRedirect | Boolean | Disable cross-domain redirects |

#### Response

The response format matches the standard Wappalyzer output format:

```json
{
  "urls": {
    "https://example.com/": {
      "status": 200
    }
  },
  "technologies": [
    {
      "slug": "nginx",
      "name": "Nginx",
      "confidence": 100,
      "version": "1.17.3",
      "icon": "Nginx.svg",
      "website": "https://nginx.org/en/",
      "cpe": "cpe:/a:nginx:nginx",
      "categories": [
        {
          "id": 22,
          "slug": "web-servers",
          "name": "Web servers"
        }
      ]
    }
  ],
  "meta": {
    "language": "en"
  }
}
```

#### Error Response

```json
{
  "error": "Error message",
  "message": "Detailed error message"
}
```

## Docker Usage

You can also run this API in a Docker container:

```bash
# Build Docker image
docker build -t wappalyzer-api .

# Run Docker container
docker run -p 3000:3000 wappalyzer-api
```

## Examples

### Using cURL

```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

### Using JavaScript (Node.js)

```javascript
const fetch = require('node-fetch');

async function analyzeWebsite(url) {
  const response = await fetch('http://localhost:3000/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      options: {
        maxWait: 15000,
      },
    }),
  });
  
  return response.json();
}

analyzeWebsite('https://example.com')
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

## Notes

- The API server uses Puppeteer to analyze websites, which requires a headless Chrome browser.
- For Docker deployments, the included Dockerfile sets up the necessary environment.
- Rate limiting is not included by default. Consider adding it for production use. 