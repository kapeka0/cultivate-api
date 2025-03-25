const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = process.env.NODE_ENV === 'development' ? {} : {
    // Changes the cache location for Puppeteer.
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};