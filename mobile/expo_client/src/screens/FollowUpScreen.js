import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '../styles/theme';
import { StepperTracker } from '../components/StepperTracker';
import { StarRating } from '../components/StarRating';

export const FollowUpScreen = ({
  setCurrentScreen,
  response,
  isDarkMode,
}) => {
  const styles = useStyles(isDarkMode);

  const schedule = response?.data?.follow_up_schedule || [];
  const provider = response?.selectedProvider;

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('booking_confirmation')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="arrow-back-outline" size={24} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
          <Text style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A', fontWeight: 'bold', fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontWeight: 'bold', fontSize: 16 }}>Follow-Up Status</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.scrollContent}>
        {/* Active Provider mini card */}
        <View style={styles.card}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#06B6D4', letterSpacing: 1.2 }}>ACTIVE PROVIDER ASSIGNED</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDarkMode ? '#FFF' : '#0F172A', marginTop: 4 }}>
            {provider?.name || "Service Provider"}
          </Text>
          <Text style={[styles.cardText, { marginTop: 4 }]}>Phone: {provider?.phone || "+92 314 8181802"}</Text>
        </View>

        {/* Stepper Timeline Tracker */}
        {schedule.length > 0 && <StepperTracker schedule={schedule} isDarkMode={isDarkMode} />}

        {/* Quality Rating Form */}
        <StarRating isDarkMode={isDarkMode} />

        {/* File Complaint / Cancellation Trigger */}
        <TouchableOpacity 
          style={[styles.secondaryBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444', borderWidth: 1 }]} 
          onPress={() => setCurrentScreen('dispute')}
        >
          <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>FILE COMPLAINT OR CANCEL BOOKING</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
