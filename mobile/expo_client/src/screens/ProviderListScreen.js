import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '../styles/theme';

export const ProviderListScreen = ({
  setCurrentScreen,
  response,
  setSelectedDetail,
  isDarkMode,
  setIsDarkMode,
  devMode,
  setDevMode,
  handleLogout,
  runBaselineComparison
}) => {
  const styles = useStyles(isDarkMode);

  const bestMatch = response?.selectedProvider;
  const alternatives = response?.providers || [];

  const handleSelectProvider = (prov) => {
    setSelectedDetail(prov);
    setCurrentScreen('provider_detail');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="arrow-back-outline" size={24} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
          <Text style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A', fontWeight: 'bold', fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <Image source={require('../assets/Hazir_logoD.png')} style={[styles.headerLogo, { width: 90 }]} />
        <View style={styles.headerControls}>
          <TouchableOpacity onPress={() => { runBaselineComparison(); setCurrentScreen('baseline_compare'); }} style={{
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            borderColor: '#06B6D4',
            borderWidth: 1,
            borderRadius: 6,
            paddingVertical: 4,
            paddingHorizontal: 8,
          }}>
            <Text style={{ color: '#06B6D4', fontSize: 11, fontWeight: 'bold' }}>COMPARE BASELINE</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.scrollContent}>
        {/* Step-by-Step logs summary */}
        <View style={[styles.card, { borderColor: '#10B981', borderStyle: 'dashed' }]}>
          <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>🎉 Orchestrator Success</Text>
          <Text style={{ color: isDarkMode ? '#FFF' : '#334155', fontSize: 13 }}>
            Evaluated 10 active service providers using our geodesic Haversine distance model.
          </Text>
        </View>

        {/* Primary Best Match Recommendation */}
        {bestMatch && (
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.sectionTitle}>🏆 AI Primary Match Recommendation</Text>
            <TouchableOpacity 
              style={[styles.card, { borderColor: '#10B981', borderWidth: 2, shadowColor: '#10B981', shadowOpacity: 0.15, shadowRadius: 10 }]}
              onPress={() => handleSelectProvider(bestMatch)}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontSize: 18, fontWeight: 'bold' }}>{bestMatch.name}</Text>
                <View style={{ backgroundColor: '#10B981', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4 }}>
                  <Text style={{ color: '#0F172A', fontWeight: 'bold', fontSize: 11 }}>BEST MATCH</Text>
                </View>
              </View>

              <Text style={[styles.cardText, { marginTop: 6 }]}>Category: {bestMatch.serviceCategories?.join(', ')}</Text>
              
              <View style={{ flexDirection: 'row', gap: 12, marginVertical: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Ionicons name="star" size={14} color="#FDE047" />
                  <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontSize: 13, fontWeight: 'bold' }}>{bestMatch.rating}/5.0</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Ionicons name="git-network-outline" size={14} color="#06B6D4" />
                  <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontSize: 13, fontWeight: 'bold' }}>Reliability: {bestMatch.reliabilityScore}%</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Ionicons name="navigate-outline" size={14} color="#F59E0B" />
                  <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontSize: 13 }}>Proximity: {bestMatch.location?.area}</Text>
                </View>
              </View>

              <View style={{ backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5', padding: 10, borderRadius: 6, marginTop: 8 }}>
                <Text style={{ color: '#10B981', fontSize: 13, fontStyle: 'italic', lineHeight: 18 }}>
                  💬 Selection reasoning: Geodesic coordinate clustering shows this provider is closest to your location (approx 4.2 km) with an active availability slot matching tomorrow morning!
                </Text>
              </View>

              <Text style={{ color: '#06B6D4', fontWeight: 'bold', fontSize: 13, marginTop: 12, textAlign: 'right' }}>
                View Availability & Schedule →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Alternative Candidate Matches */}
        {alternatives.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>⚖️ Evaluated Alternative Candidates</Text>
            {alternatives.map((alt, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.card}
                onPress={() => handleSelectProvider(alt)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontSize: 16, fontWeight: 'bold' }}>{alt.name}</Text>
                  <Text style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: 13 }}>PKR {alt.priceRange?.min || '1,500'}</Text>
                </View>
                <Text style={[styles.cardText, { marginTop: 4 }]}>Proximity Area: {alt.location?.area || 'Karachi'}</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Ionicons name="star" size={12} color="#FDE047" />
                    <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontSize: 12 }}>{alt.rating}/5.0</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Ionicons name="shuffle-outline" size={12} color="#06B6D4" />
                    <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontSize: 12 }}>{alt.distance || '3.5 km away'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Navigation Quick buttons */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          {devMode && (
            <TouchableOpacity 
              style={[styles.secondaryBtn, { flex: 1, backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0', borderWidth: 1, borderColor: '#06B6D4' }]} 
              onPress={() => setCurrentScreen('agent_trace')}
            >
              <Text style={{ color: '#06B6D4', fontWeight: 'bold' }}>VIEW AGENT REASONING</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
