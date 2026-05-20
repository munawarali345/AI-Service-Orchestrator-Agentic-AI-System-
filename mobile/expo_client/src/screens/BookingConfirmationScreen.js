import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '../styles/theme';
import { DynamicReceipt } from '../components/DynamicReceipt';

export const BookingConfirmationScreen = ({
  setCurrentScreen,
  response,
  isDarkMode,
}) => {
  const styles = useStyles(isDarkMode);

  const receipt = response?.data?.dynamic_receipt;
  const provider = response?.selectedProvider;

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontWeight: 'bold', fontSize: 16 }}>Booking Confirmation</Text>
      </View>

      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.scrollContent}>
        {/* Status Alert */}
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <View style={{ backgroundColor: '#10B981', padding: 12, borderRadius: 50, marginBottom: 12 }}>
            <Ionicons name="checkmark-sharp" size={32} color="#0F172A" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDarkMode ? '#FFF' : '#0F172A' }}>
            Request Successfully Sent!
          </Text>
          <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 14, marginTop: 4, textAlign: 'center' }}>
            Your booking request has been dispatched to {provider?.name || 'the selected provider'}.
          </Text>
        </View>

        {/* Dynamic Proximity Receipt */}
        {receipt && <DynamicReceipt receipt={receipt} isDarkMode={isDarkMode} />}

        {/* SMS Preview draft */}
        {response?.data?.client_confirmation_sms && (
          <View style={[styles.card, { borderStyle: 'dashed', backgroundColor: isDarkMode ? '#020617' : '#F1F5F9' }]}>
            <Text style={{ color: '#06B6D4', fontWeight: 'bold', fontSize: 13, marginBottom: 6 }}>💬 Confirmed SMS Alert Sent</Text>
            <Text style={{ color: isDarkMode ? '#FFF' : '#334155', fontSize: 14, fontStyle: 'italic', lineHeight: 20 }}>
              "{response.data.client_confirmation_sms}"
            </Text>
          </View>
        )}

        {/* CTA to timeline Follow-up */}
        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={() => setCurrentScreen('follow_up')}
        >
          <Text style={styles.primaryBtnText}>TRACK STATUS & TIMELINE</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
