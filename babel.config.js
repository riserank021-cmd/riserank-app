module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // NativeWind v4 requires this plugin
    'nativewind/babel',
    // Reanimated plugin must come last
    'react-native-reanimated/plugin',
  ],
};
