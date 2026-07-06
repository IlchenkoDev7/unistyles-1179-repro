module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    // Reanimated's plugin first, then unistyles'. The unistyles babel plugin
    // also processes reanimated components by default.
    plugins: [
      'react-native-reanimated/plugin',
      ['react-native-unistyles/plugin', { root: 'src' }],
    ],
  };
};
