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
        <Image source={require('../../assets/Hazir_logoD.png')} style={[styles.headerLogo, { width: 90 }]} />
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
        {/* Booking Confirmation Message from AI */}
        <View style={[styles.card, { borderColor: '#10B981', borderStyle: 'dashed' }]}>
          <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>🎉 Booking Confirmed</Text>
          <Text style={{ color: isDarkMode ? '#FFF' : '#334155', fontSize: 13, lineHeight: 20 }}>
            {response?.recommendation?.userMessage || 'Aapki request process ho gayi hai.'}
          </Text>
        </View>

        {/* Primary Best Match Recommendation */}
        {bestMatch && (
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.sectionTitle}>🏆 AI Best Match</Text>
            <TouchableOpacity
              style={[styles.card, { borderColor: '#10B981', borderWidth: 2, shadowColor: '#10B981', shadowOpacity: 0.15, shadowRadius: 10 }]}
              onPress={() => handleSelectProvider(bestMatch)}
            >
              {/* Name + Badge */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontSize: 17, fontWeight: 'bold', flex: 1 }}>
                  {bestMatch.name || response?.recommendation?.recommendedProvider?.name}
                </Text>
                <View style={{ backgroundColor: '#10B981', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4 }}>
                  <Text style={{ color: '#0F172A', fontWeight: 'bold', fontSize: 11 }}>BEST MATCH</Text>
                </View>
              </View>

              {/* Category */}
              <Text style={[styles.cardText, { marginTop: 4 }]}>
                {bestMatch.serviceCategories?.join(', ') || response?.recommendation?.recommendedProvider?.area}
              </Text>

              {/* Stats Row */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons name="star" size={13} color="#FDE047" />
                  <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontSize: 13, fontWeight: 'bold' }}>
                    {bestMatch.rating || response?.recommendation?.recommendedProvider?.rating}/5.0
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons name="podium-outline" size={13} color="#A78BFA" />
                  <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontSize: 13 }}>
                    Score: {bestMatch.score ?? '—'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons name="git-network-outline" size={13} color="#06B6D4" />
                  <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontSize: 13 }}>
                    {bestMatch.reliabilityScore}% Reliable
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons name="navigate-outline" size={13} color="#F59E0B" />
                  <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontSize: 13 }}>
                    {bestMatch.computedDistance || response?.recommendation?.recommendedProvider?.distance || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Price Breakdown */}
              {(bestMatch.pricingDetails || response?.recommendation?.recommendedProvider?.pricingDetails) && (
                <View style={{ backgroundColor: isDarkMode ? 'rgba(16,185,129,0.06)' : '#F0FDF4', borderRadius: 6, padding: 8, marginTop: 8 }}>
                  <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>💰 Price Breakdown</Text>
                  {(() => {
                    const pd = bestMatch.pricingDetails || response?.recommendation?.recommendedProvider?.pricingDetails;
                    return (
                      <View style={{ gap: 2 }}>
                        <Text style={{ color: isDarkMode ? '#CBD5E1' : '#475569', fontSize: 12 }}>Base: PKR {pd?.basePrice ?? '—'}</Text>
                        {pd?.distanceCost > 0 && <Text style={{ color: isDarkMode ? '#CBD5E1' : '#475569', fontSize: 12 }}>Distance: +PKR {pd.distanceCost}</Text>}
                        {pd?.urgencyCost > 0 && <Text style={{ color: '#F59E0B', fontSize: 12 }}>Urgency: +PKR {pd.urgencyCost}</Text>}
                        {pd?.peakCost > 0 && <Text style={{ color: '#EF4444', fontSize: 12 }}>Peak Hour: +PKR {pd.peakCost}</Text>}
                        <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 13, marginTop: 4 }}>Total: PKR {pd?.totalPrice ?? '—'}</Text>
                      </View>
                    );
                  })()}
                </View>
              )}

              {/* Matched Slot */}
              {(bestMatch.matchedSlot || response?.recommendation?.recommendedProvider?.matchedSlot) && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <Ionicons name="calendar-outline" size={13} color="#06B6D4" />
                  <Text style={{ color: '#06B6D4', fontSize: 13, fontWeight: 'bold' }}>
                    {(bestMatch.matchedSlot || response?.recommendation?.recommendedProvider?.matchedSlot)?.date}
                    {'  '}
                    {(bestMatch.matchedSlot || response?.recommendation?.recommendedProvider?.matchedSlot)?.timeSlot}
                  </Text>
                </View>
              )}

              {/* Why Selected */}
              <View style={{ backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5', padding: 10, borderRadius: 6, marginTop: 10 }}>
                <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 12, marginBottom: 3 }}>✅ Why Selected:</Text>
                <Text style={{ color: '#10B981', fontSize: 12, fontStyle: 'italic', lineHeight: 18 }}>
                  {response?.recommendation?.recommendedProvider?.reason || 'Highest overall score among all evaluated candidates.'}
                </Text>
              </View>

              <Text style={{ color: '#06B6D4', fontWeight: 'bold', fontSize: 13, marginTop: 12, textAlign: 'right' }}>
                Tap to Book & View Full Details →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Alternative Candidate Matches — Info Only, Not Clickable */}
        {(response?.recommendation?.alternatives || []).length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>⚖️ Alternative Candidates</Text>
            {(response?.recommendation?.alternatives || []).map((alt, index) => (
              <View
                key={index}
                style={[styles.card, { borderLeftWidth: 3, borderLeftColor: '#F59E0B' }]}
              >
                {/* Name + Price */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontSize: 15, fontWeight: 'bold', flex: 1 }}>
                    {alt.name}
                  </Text>
                  <View style={{ backgroundColor: isDarkMode ? 'rgba(245,158,11,0.15)' : '#FEF3C7', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4 }}>
                    <Text style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: 12 }}>
                      PKR {alt.pricingDetails?.totalPrice || '—'}
                    </Text>
                  </View>
                </View>

                {/* Area + Distance + Peak */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Ionicons name="location-outline" size={12} color="#94A3B8" />
                    <Text style={{ color: isDarkMode ? '#CBD5E1' : '#64748B', fontSize: 12 }}>{alt.area}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Ionicons name="navigate-outline" size={12} color="#F59E0B" />
                    <Text style={{ color: isDarkMode ? '#CBD5E1' : '#64748B', fontSize: 12 }}>{alt.distance || 'N/A'}</Text>
                  </View>
                  {alt.pricingDetails?.peakCost > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Ionicons name="time-outline" size={12} color="#EF4444" />
                      <Text style={{ color: '#EF4444', fontSize: 12 }}>Peak Hour</Text>
                    </View>
                  )}
                </View>

                {/* Rating + Score + Budget Fit */}
                <View style={{ flexDirection: 'row', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Ionicons name="star" size={12} color="#FDE047" />
                    <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontSize: 12 }}>{alt.rating || '—'}/5.0</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Ionicons name="podium-outline" size={12} color="#A78BFA" />
                    <Text style={{ color: isDarkMode ? '#CBD5E1' : '#64748B', fontSize: 12 }}>Score: {alt.score ?? '—'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Ionicons name="wallet-outline" size={12} color="#10B981" />
                    <Text style={{ color: isDarkMode ? '#CBD5E1' : '#64748B', fontSize: 12 }}>{alt.priceEvaluation || '—'}</Text>
                  </View>
                </View>

                {/* Matched Slot */}
                {alt.matchedSlot && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <Ionicons name="calendar-outline" size={12} color="#06B6D4" />
                    <Text style={{ color: '#06B6D4', fontSize: 12 }}>
                      {alt.matchedSlot.date}  {alt.matchedSlot.timeSlot}
                    </Text>
                  </View>
                )}

                {/* AI Reason */}
                {alt.reason && (
                  <View style={{ backgroundColor: isDarkMode ? 'rgba(245,158,11,0.08)' : '#FFFBEB', padding: 8, borderRadius: 6, marginTop: 8 }}>
                    <Text style={{ color: '#F59E0B', fontSize: 12, fontStyle: 'italic', lineHeight: 17 }}>
                      💬 {alt.reason}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        
      </ScrollView>
    </View>
  );
};
