module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    // NativeWind v4: must be a preset (returns {plugins:[...]})
    'nativewind/babel',
  ],
  plugins: [
    // Reanimated plugin must come last
    'react-native-reanimated/plugin',
  ],
};
