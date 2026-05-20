import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, Image } from 'react-native';
import { useStyles } from '../styles/theme';

export const AuthChoiceScreen = ({
  setCurrentScreen,
  isDarkMode,
  setIsDarkMode,
  handleLogin,
  authError,
  authLoading
}) => {
  const styles = useStyles(isDarkMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.centerContainer}>
      <View style={styles.themeToggleFloat}>
        <Text style={styles.switchLabel}>{isDarkMode ? 'Dark' : 'Light'}</Text>
        <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
      </View>
      <View style={styles.authBrandContainer}>
        <Image source={require('../assets/Hazir_logoD.png')} style={styles.authLogo} resizeMode="contain" />
        <Text style={styles.authWelcome}>Haazir AI</Text>
        <Text style={styles.splashSubtitleAuth}>Fikr chhoro, hum hain na!</Text>
      </View>
      <View style={styles.authCard}>
        <Text style={styles.authTitle}>Authentication Hub</Text>
        {authError ? <Text style={styles.validationError}>{authError}</Text> : null}
        
        <TextInput
          style={styles.inputAuth}
          placeholder="Email Address"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.inputAuth}
          placeholder="Password"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.btnRow}>
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={() => handleLogin(email, password)}
            disabled={authLoading}
          >
            <Text style={styles.primaryBtnText}>{authLoading ? 'SIGNING IN...' : 'SIGN IN'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.linkRow, { justifyContent: 'center' }]}>
          <TouchableOpacity onPress={() => setCurrentScreen('signup_user')}>
            <Text style={styles.linkText}>Don't have an account? Sign up as User</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
