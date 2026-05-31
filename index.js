/**
 * RiseRank — React Native Entry Point
 * Registers the root App component with the AppRegistry.
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// NativeWind v4: import global CSS so Tailwind styles are processed
import './global.css';

AppRegistry.registerComponent(appName, () => App);
