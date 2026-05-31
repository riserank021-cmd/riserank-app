/**
 * navigationRef — a stable ref to the NavigationContainer instance.
 *
 * Used to trigger navigation from outside the React tree (e.g. from FCM
 * background notification handlers or native modules).
 *
 * Usage:
 *   import { navigationRef, navigate } from './navigationRef';
 *
 *   // In App.tsx
 *   <NavigationContainer ref={navigationRef} ...>
 *
 *   // Anywhere else
 *   navigate('QuizDetail', { quizId: 'abc' });
 */

import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation.types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a named route from outside the component tree.
 * Silently no-ops if the navigator isn't ready yet.
 */
export function navigateFromRef(name: string, params?: object) {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(CommonActions.navigate({ name, params }));
}
