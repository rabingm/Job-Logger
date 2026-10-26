const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');
const config = getDefaultConfig(__dirname);
// tslib 1.x's import wrapper assumes a CJS default export that Metro does not
// synthesize. Resolve each caller's own CJS entry, preserving its pinned version.
config.resolver.resolveRequest = (context, name, platform) => {
  if (name === 'tslib') return { type: 'sourceFile', filePath: require.resolve('tslib', { paths: [path.dirname(context.originModulePath)] }) };
  return context.resolveRequest(context, name, platform);
};
module.exports = config;
