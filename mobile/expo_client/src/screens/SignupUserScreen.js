import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useStyles } from '../styles/theme';

export const SignupUserScreen = ({ setCurrentScreen, isDarkMode, handleRegisterUser, authLoading, authError }) => {
  const styles = useStyles(isDarkMode);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  const submitSignup = () => {
    if (!name || !email || !phone || !password || !address || !city) {
      alert('Please fill out all required fields marked with *');
      return;
    }
    handleRegisterUser({ name, email, phone, password, address, city });
  };

  return (
    <ScrollView contentContainerStyle={styles.centerScroll}>
      <View style={styles.authCard}>
        <Text style={styles.authTitle}>User Account Registration</Text>
        {authError ? <Text style={styles.validationError}>{authError}</Text> : null}

        <TextInput style={styles.inputAuth} placeholder="Full Name *" placeholderTextColor="#64748B" value={name} onChangeText={setName} />
        <TextInput style={styles.inputAuth} placeholder="Email *" placeholderTextColor="#64748B" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.inputAuth} placeholder="Phone Number *" placeholderTextColor="#64748B" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextInput style={styles.inputAuth} placeholder="Password *" placeholderTextColor="#64748B" secureTextEntry value={password} onChangeText={setPassword} />
        <TextInput style={styles.inputAuth} placeholder="Address *" placeholderTextColor="#64748B" value={address} onChangeText={setAddress} />
        <TextInput style={styles.inputAuth} placeholder="City *" placeholderTextColor="#64748B" value={city} onChangeText={setCity} />
        
        <TouchableOpacity style={[styles.primaryBtn, { marginTop: 10 }]} onPress={submitSignup} disabled={authLoading}>
          <Text style={styles.primaryBtnText}>{authLoading ? 'Registering...' : 'Register User Account'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => setCurrentScreen('auth_choice')}>
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
