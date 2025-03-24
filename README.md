# Cultivate API

A RESTful API that identifies technologies used on websites using Puppeteer to mimic browser behavior.

> **Note:** This API is built off of the Wappalyzer technology - and serving it via an Express Server. Find the original repository [here](https://github.com/developit/wappalyzer).


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

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| url | String | **Required.** The URL to analyze | - |
| options | Object | Optional configuration object | `{}` |
| options.debug | Boolean | Enable debug mode | `false` |
| options.delay | Number | Wait time between requests (ms) | `500` |
| options.maxUrls | Number | Maximum number of URLs to analyze | `1` |
| options.maxWait | Number | Maximum wait time for page resources (ms) | `10000` |
| options.recursive | Boolean | Follow links on pages (crawler mode) | `false` |
| options.probe | Boolean | Perform deeper scan with additional requests | `false` |
| options.userAgent | String | Custom user agent string | `"Wappalyzer"` |
| options.headers | Object | Custom HTTP headers | `{}` |
| options.localStorage | Object | Local storage data | `{}` |
| options.sessionStorage | Object | Session storage data | `{}` |
| options.htmlMaxCols | Number | Limit HTML characters per line processed | `2000` |
| options.htmlMaxRows | Number | Limit HTML lines processed | `3000` |
| options.noScripts | Boolean | Disable JavaScript on web pages | `false` |
| options.noRedirect | Boolean | Disable cross-domain redirects | `false` |

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
<!-- 
## Docker Usage

You can also run this API in a Docker container:

```bash
# Build Docker image
docker build -t wappalyzer-api .

# Run Docker container
docker run -p 3000:3000 wappalyzer-api
``` -->

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
- The latest technologies are updated from this repository maintained by [@enthec](https://github.com/enthec/webappanalyzer) 
