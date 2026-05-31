const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * NativeWind v4 wraps the config to process Tailwind CSS at bundling time.
 */

const config = mergeConfig(getDefaultConfig(__dirname), {
  // project-level customizations go here
});

module.exports = withNativeWind(config, {
  input: './global.css',
});
