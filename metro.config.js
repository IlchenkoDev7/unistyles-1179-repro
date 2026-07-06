// Stock Expo Metro config — no custom resolver. Kept explicit so reviewers can
// confirm nothing unusual is going on in the bundler.
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
