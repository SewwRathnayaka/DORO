const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Exclude Electron main process file and other Node.js files from Metro bundling
// blockList prevents Metro from resolving these files
const existingBlockList = Array.isArray(config.resolver?.blockList) 
  ? config.resolver.blockList 
  : [];

config.resolver = {
  ...config.resolver,
  blockList: [
    ...existingBlockList,
    /electron-main\.js$/,
    /fix-web-package\.js$/,
    /electron-main/,
  ],
  // Also exclude from source extensions to prevent Metro from processing them
  sourceExts: (config.resolver?.sourceExts || []).filter(ext => ext !== 'electron-main.js'),
};

// Set a custom entry point for Expo (not electron-main.js)
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Block requests for electron-main.js
      if (req.url && req.url.includes('electron-main')) {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, { input: './src/index.css' });
