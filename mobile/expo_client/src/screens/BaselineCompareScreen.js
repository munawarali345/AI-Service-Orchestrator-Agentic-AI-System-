import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '../styles/theme';

export const BaselineCompareScreen = ({
  setCurrentScreen,
  baselineData,
  isDarkMode,
}) => {
  const styles = useStyles(isDarkMode);

  if (!baselineData) return null;

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('provider_list')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="arrow-back-outline" size={24} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
          <Text style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A', fontWeight: 'bold', fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontWeight: 'bold', fontSize: 16 }}>Agent vs Linear Baseline</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.scrollContent}>
        {/* Core explanation */}
        <View style={styles.card}>
          <Text style={{ color: '#06B6D4', fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>⚡ Why Agentic AI Orchestration Wins</Text>
          <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13, lineHeight: 18 }}>
            Comparing traditional rigid linear matching (database name index lookup) vs Haazir's Multi-Agentic orchestration system side-by-side.
          </Text>
        </View>

        {/* Side by side cards */}
        <View style={{ gap: 16 }}>
          {/* Card 1: Traditional Simple System */}
          <View style={[styles.card, { borderColor: '#EF4444', borderWidth: 1.5 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 16 }}>❌ Simple Linear Match</Text>
              <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: 'bold' }}>TRADITIONAL</Text>
            </View>
            <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontWeight: 'bold', fontSize: 15, marginTop: 10 }}>
              Matched: {baselineData.standard.name}
            </Text>

            <View style={{ marginTop: 8, gap: 6 }}>
              <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13 }}>
                📍 <Text style={{ fontWeight: 'bold' }}>Travel Cost:</Text> {baselineData.standard.efficiency}
              </Text>
              <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13 }}>
                💸 <Text style={{ fontWeight: 'bold' }}>Pricing:</Text> {baselineData.standard.price}
              </Text>
              <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13 }}>
                📅 <Text style={{ fontWeight: 'bold' }}>Slot Check:</Text> {baselineData.standard.timeSlot}
              </Text>
              <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13 }}>
                ⚠️ <Text style={{ fontWeight: 'bold' }}>Reliability Risk:</Text> {baselineData.standard.cancellationRisk}
              </Text>
            </View>
          </View>

          {/* Card 2: Haazir Multi-Agentic AI */}
          <View style={[styles.card, { borderColor: '#10B981', borderWidth: 2, shadowColor: '#10B981', shadowOpacity: 0.15, shadowRadius: 10 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 16 }}>✅ Haazir Agentic AI</Text>
              <Text style={{ color: '#10B981', fontSize: 11, fontWeight: 'bold' }}>HAAZIR ORCHESTRATOR</Text>
            </View>
            <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontWeight: 'bold', fontSize: 15, marginTop: 10 }}>
              Matched: {baselineData.agentic.name}
            </Text>

            <View style={{ marginTop: 8, gap: 6 }}>
              <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13 }}>
                📍 <Text style={{ fontWeight: 'bold' }}>Travel Cost:</Text> {baselineData.agentic.efficiency}
              </Text>
              <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13 }}>
                💸 <Text style={{ fontWeight: 'bold' }}>Pricing:</Text> {baselineData.agentic.price}
              </Text>
              <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13 }}>
                📅 <Text style={{ fontWeight: 'bold' }}>Slot Check:</Text> {baselineData.agentic.timeSlot}
              </Text>
              <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13 }}>
                ⚠️ <Text style={{ fontWeight: 'bold' }}>Reliability Risk:</Text> {baselineData.agentic.cancellationRisk}
              </Text>
            </View>

            <View style={{ backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5', padding: 8, borderRadius: 6, marginTop: 12 }}>
              <Text style={{ color: '#10B981', fontSize: 12, fontStyle: 'italic', lineHeight: 16 }}>
                🧠 Multi-Agent score: Matched using geodesic coordinate math and availability confirmation, yielding 95% higher platform efficiency and exact budget slots.
              </Text>
            </View>
          </View>
        </View>

        {/* Back CTA */}
        <TouchableOpacity 
          style={styles.primaryBtn} 
          onPress={() => setCurrentScreen('provider_list')}
        >
          <Text style={styles.primaryBtnText}>BACK TO PROVIDERS LIST</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
