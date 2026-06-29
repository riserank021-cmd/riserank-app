/**
 * ErrorBoundary — catches unhandled JS errors in the render tree.
 * Wrap <NavigationContainer> with this in App.tsx.
 *
 * React class component is required because error boundaries must use
 * componentDidCatch / getDerivedStateFromError lifecycle methods.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Props {
  children: ReactNode;
  /** Optional callback to report the error to an external service */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Optional navigation ref to allow going back from error screen */
  navigationRef?: React.RefObject<any>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ errorInfo: info });

    // Forward to external error reporter (Sentry, Crashlytics, etc.)
    this.props.onError?.(error, info);

    // Dev console
    if (__DEV__) {
      console.error('[ErrorBoundary] Uncaught error:', error);
      console.error('[ErrorBoundary] Component stack:', info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleGoBack = () => {
    this.handleReset();
    // Try navigation ref first
    const nav = this.props.navigationRef?.current;
    if (nav?.canGoBack?.()) {
      nav.goBack();
    }
    // Fallback: Android hardware back
    BackHandler.exitApp();
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state;

    if (!hasError) {
      return this.props.children;
    }

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <Text style={{ fontSize: 72, marginBottom: 16 }}>⚠️</Text>

          {/* Heading */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#0F172A',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Something went wrong
          </Text>

          {/* Sub-text */}
          <Text
            style={{
              fontSize: 14,
              color: '#64748B',
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 32,
              maxWidth: 320,
            }}
          >
            An unexpected error occurred. You can go back or try again.
          </Text>

          {/* Go Back button */}
          <TouchableOpacity
            onPress={this.handleGoBack}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#2563EB',
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 40,
              marginBottom: 12,
              minWidth: 200,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
              ← Go Back
            </Text>
          </TouchableOpacity>

          {/* Retry button */}
          <TouchableOpacity
            onPress={this.handleReset}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#F1F5F9',
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 40,
              marginBottom: 12,
              minWidth: 200,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#1E293B', fontWeight: '600', fontSize: 15 }}>
              Try Again
            </Text>
          </TouchableOpacity>

          {/* Show details toggle (debug) */}
          {__DEV__ && error && (
            <>
              <TouchableOpacity onPress={this.toggleDetails} style={{ marginTop: 8 }}>
                <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                  {showDetails ? '▲ Hide details' : '▼ Show error details'}
                </Text>
              </TouchableOpacity>

              {showDetails && (
                <View
                  style={{
                    marginTop: 16,
                    backgroundColor: '#1E293B',
                    borderRadius: 8,
                    padding: 16,
                    width: '100%',
                  }}
                >
                  <Text
                    style={{
                      color: '#F87171',
                      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                      fontSize: 11,
                      lineHeight: 18,
                    }}
                    selectable
                  >
                    {error.toString()}
                    {errorInfo?.componentStack
                      ? `\n\nComponent Stack:${errorInfo.componentStack}`
                      : ''}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}
