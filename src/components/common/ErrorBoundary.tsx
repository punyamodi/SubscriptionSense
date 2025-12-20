import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Colors } from '../../theme/colors';
import { telemetry } from '../../services/analytics/telemetry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    telemetry.logError(error, { componentStack: errorInfo.componentStack });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <Ionicons name="alert" size={48} color={Colors.error} />
            </View>
            
            <AppText variant="serifBold" size="2xl" align="center" style={styles.title}>
              Oops! Something went wrong.
            </AppText>
            
            <AppText variant="regular" size="base" color={Colors.text.secondary} align="center" style={styles.message}>
              We encountered an unexpected error. Please try again or restart the app.
            </AppText>

            <TouchableOpacity 
              style={styles.button}
              onPress={this.resetError}
              activeOpacity={0.8}
            >
              <AppText variant="semibold" size="base" color="#FFF">
                Try Again
              </AppText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.detailsButton}             
            >
              <AppText variant="medium" size="sm" color={Colors.text.tertiary}>
                {this.state.error?.message}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Colors.error}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
  },
  message: {
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsButton: {
    padding: 8,
  }
});
