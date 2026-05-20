import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '../styles/theme';

export const ProviderDetailScreen = ({
  setCurrentScreen,
  selectedDetail,
  isDarkMode,
}) => {
  const styles = useStyles(isDarkMode);

  if (!selectedDetail) return null;

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('provider_list')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="arrow-back-outline" size={24} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
          <Text style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A', fontWeight: 'bold', fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontWeight: 'bold', fontSize: 16 }}>Provider Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.card}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: isDarkMode ? '#FFF' : '#0F172A' }}>{selectedDetail.name}</Text>
          <Text style={{ color: '#06B6D4', fontSize: 14, fontWeight: '600', marginTop: 4 }}>
            Specialist: {selectedDetail.specializations?.join(', ') || 'Professional Service'}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: isDarkMode ? '#334155' : '#E2E8F0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="star" size={16} color="#FDE047" />
              <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontWeight: 'bold' }}>{selectedDetail.rating || '4.5'} Rating</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
              <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontWeight: 'bold' }}>{selectedDetail.totalJobs || '150'} Jobs Completed</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#06B6D4" />
              <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontWeight: 'bold' }}>{selectedDetail.reliabilityScore || '95'}% Reliability</Text>
            </View>
          </View>
        </View>

        {/* Location & Details */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>📍 Physical Proximity & Coordinates</Text>
          <Text style={styles.cardText}>Area: {selectedDetail.location?.area || 'Karachi'}</Text>
          <Text style={styles.cardText}>Address: {selectedDetail.location?.address || 'Verified Address, Karachi'}</Text>
          <Text style={styles.cardText}>Operating hours: {selectedDetail.working_hours?.start || '09:00 AM'} - {selectedDetail.working_hours?.end || '06:00 PM'}</Text>
        </View>

        {/* Dynamic Reviews */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>💬 Recent Lightweight Customer Reviews</Text>
          {[
            { name: "Mustafa Qureshi", date: "2 days ago", comment: "Outstanding service. The response time was extremely fast and the work was highly professional!" },
            { name: "Siddique Lakhani", date: "1 week ago", comment: "Highly reliable AC service. Explained everything in detail, highly recommended." }
          ].map((rev, i) => (
            <View key={i} style={{ marginBottom: 12, borderBottomWidth: i === 0 ? 1 : 0, borderBottomColor: isDarkMode ? '#334155' : '#E2E8F0', pb: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontWeight: 'bold', fontSize: 13 }}>{rev.name}</Text>
                <Text style={{ color: isDarkMode ? '#64748B' : '#94A3B8', fontSize: 11 }}>{rev.date}</Text>
              </View>
              <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13, marginTop: 4 }}>{rev.comment}</Text>
            </View>
          ))}
        </View>

        {/* Immediate CTA Booking */}
        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={() => setCurrentScreen('booking_confirmation')}
        >
          <Text style={styles.primaryBtnText}>CONFIRM BOOKING & VIEW BILL</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
