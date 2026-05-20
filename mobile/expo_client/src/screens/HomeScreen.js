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
  loadingPhase,
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

  // Premium Custom Dynamic Phase Loader overlay instead of standard spinner
  if (loading) {
    const phases = [
      'Intent Parsing...',
      'Finding nearest providers...',
      'Ranking providers...',
      'Checking availability...',
      'Preparing recommendation...'
    ];
    const currentIdx = phases.indexOf(loadingPhase);
    
    return (
      <View style={{ flex: 1, backgroundColor: isDarkMode ? '#0B0F19' : '#F8FAFC', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderRadius: 24,
          padding: 30,
          borderWidth: 1.5,
          borderColor: '#06B6D4',
          shadowColor: '#06B6D4',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 12,
          alignItems: 'center'
        }}>
          {/* Glowing Pulse Scanner */}
          <Animated.View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
            borderWidth: 2,
            borderColor: '#06B6D4',
            opacity: pulseAnim
          }}>
            <Ionicons name="hardware-chip-outline" size={36} color="#06B6D4" />
          </Animated.View>

          <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDarkMode ? '#FFF' : '#0F172A', textAlign: 'center', marginBottom: 6 }}>
            Haazir AI Orchestrator
          </Text>
          <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 24 }}>
            Executing 6-stage cognitive agentic workflow...
          </Text>

          {/* Progress Steps List */}
          <View style={{ width: '100%', gap: 12, marginBottom: 24 }}>
            {phases.map((phase, idx) => {
              const isActive = loadingPhase === phase || (loadingPhase === '' && idx === 0);
              const isPast = currentIdx > idx;
              
              return (
                <View key={phase} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: isActive ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                  borderWidth: 1,
                  borderColor: isActive ? 'rgba(6, 182, 212, 0.3)' : 'transparent'
                }}>
                  {isPast ? (
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  ) : isActive ? (
                    <Animated.View style={{ opacity: pulseAnim }}>
                      <Ionicons name="sync" size={20} color="#06B6D4" />
                    </Animated.View>
                  ) : (
                    <Ionicons name="ellipse-outline" size={20} color={isDarkMode ? '#475569' : '#94A3B8'} />
                  )}
                  <Text style={{
                    fontSize: 14,
                    fontWeight: isActive ? 'bold' : 'normal',
                    color: isPast ? '#10B981' : (isActive ? '#06B6D4' : (isDarkMode ? '#475569' : '#94A3B8'))
                  }}>
                    {phase}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Real-time thinking animation progress */}
          <View style={{ width: '100%', height: 6, backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
            <View style={{
              width: `${(((currentIdx === -1 ? 0 : currentIdx) + 1) / phases.length) * 100}%`,
              height: '100%',
              backgroundColor: '#06B6D4',
              borderRadius: 3
            }} />
          </View>
        </View>
      </View>
    );
  }

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
            <Text style={styles.primaryBtnText}>FIND BEST MATCHING PROVIDERS</Text>
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
              <TouchableOpacity key={i} onPress={() => setQuery(`Mujhe subah ek ${cat.toLowerCase()} ki zaroorat hai.`)} style={{
                backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0',
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: isDarkMode ? '#334155' : '#CBD5E1',
              }}>
                <Text style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A', fontSize: 13, fontWeight: '600' }}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
