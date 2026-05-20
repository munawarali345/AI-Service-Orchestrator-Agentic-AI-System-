import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Platform } from 'react-native';
import { useStyles } from '../styles/theme';

export const SplashScreen = ({ setCurrentScreen, isDarkMode }) => {
  const styles = useStyles(isDarkMode);
  const fillAnim = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const listenerId = fillAnim.addListener(({ value }) => {
      setProgress(Math.floor(value));
    });

    Animated.timing(fillAnim, {
      toValue: 100,
      duration: 2500,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      setCurrentScreen('auth_choice');
    }, 2500);

    return () => {
      fillAnim.removeListener(listenerId);
      clearTimeout(timer);
    };
  }, [fillAnim, setCurrentScreen]);

  const barColor = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['#06B6D4', '#10B981']
  });

  return (
    <View style={styles.splashContainer}>
      <Image source={require('../../assets/Hazir_logoD.png')} style={styles.splashLogo} resizeMode="contain" />
      <Text style={styles.splashSubtitle}>Fikr chhoro, hum hain na!</Text>
      <View style={{ width: 250, marginBottom: 8, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Animated.Text style={{ color: barColor, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
          {progress}%
        </Animated.Text>
      </View>
      <View style={styles.loadingBarContainer}>
        <Animated.View style={[styles.loadingBarFill, {
          width: fillAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
          backgroundColor: barColor
        }]} />
      </View>
    </View>
  );
};
