/**
 * React Native auto-linking configuration.
 * Most packages use auto-linking via package.json "react-native" field.
 * Override here only when a package needs special handling.
 */

module.exports = {
  project: {
    android: {
      // Point to the android/ directory (default, explicit for clarity)
      sourceDir: './android',
    },
    ios: {
      // sourceDir: './ios',  // Uncomment when iOS support is added
    },
  },
  // Assets to be copied into native projects by `react-native link`
  assets: [
    // './src/assets/fonts/',  // Add custom font directories here
  ],
};
