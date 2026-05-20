import React, { useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Animated, Image, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '../styles/theme';

export const HomeScreen = ({
  setCurrentScreen,
  query,
  setQuery,
  userLocation,
  setUserLocation,
  loading,
  handleExecute,
  isDarkMode,
  setIsDarkMode,
  devMode,
  setDevMode,
  handleLogout
}) => {
  const styles = useStyles(isDarkMode);
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={{ flex: 1 }}>
      {/* Dynamic Header */}
      <View style={styles.header}>
        <Image source={require('../assets/Hazir_logoD.png')} style={styles.headerLogo} />
        <View style={styles.headerControls}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Dev</Text>
            <Switch value={devMode} onValueChange={setDevMode} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Dark</Text>
            <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtnContainer}>
            <Ionicons name="log-out-outline" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Container */}
      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.scrollContent}>
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: isDarkMode ? '#FFF' : '#0F172A', textAlign: 'center' }}>
            What do you need done today?
          </Text>
          <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 6, fontSize: 15, textAlign: 'center', paddingHorizontal: 16 }}>
            Type your request in Roman Urdu, English, or Urdu. Our AI Orchestrator will handle the rest.
          </Text>
        </View>

        {/* Query Input Box */}
        <View style={[styles.card, { marginTop: 12, padding: 12 }]}>
          <TextInput
            style={[styles.input, { marginBottom: 12 }]}
            placeholder="e.g., Mujhe kal subah AC ki safai k liye banda chahiye..."
            placeholderTextColor="#64748B"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleExecute}
            multiline={true}
            numberOfLines={3}
          />
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="location-outline" size={18} color="#06B6D4" />
            <TextInput
              style={[styles.input, { paddingVertical: 8 }]}
              placeholder="Your Location..."
              placeholderTextColor="#64748B"
              value={userLocation}
              onChangeText={setUserLocation}
            />
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleExecute} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'ORCHESTRATING REQUEST...' : 'FIND BEST MATCHING PROVIDERS'}</Text>
          </TouchableOpacity>
        </View>

        {/* Location Clustering Chip */}
        <View style={{ alignItems: 'center', marginVertical: 12 }}>
          <Text style={{ color: isDarkMode ? '#64748B' : '#94A3B8', fontSize: 13, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 8 }}>
            ACTIVE SERVICE LOCATION
          </Text>
          <View style={{
            backgroundColor: '#0F172A',
            borderWidth: 1.5,
            borderColor: '#06B6D4',
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 28,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#06B6D4',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 8,
          }}>
            <Animated.View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#06B6D4',
              marginRight: 8,
              opacity: pulseAnim,
              shadowColor: '#06B6D4',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 4,
            }} />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1.2 }}>Karachi (Gulshan Cluster)</Text>
          </View>
        </View>

        {/* Categories Carousel */}
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            ⚡ Available On-Demand Services
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {['Plumber', 'AC Technician', 'Home Cleaning', 'Electrician', 'Appliance Repair', 'Tutor'].map((cat, i) => (
              <View key={i} style={{
                backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0',
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: isDarkMode ? '#334155' : '#CBD5E1',
              }}>
                <Text style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A', fontSize: 13, fontWeight: '600' }}>{cat}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
