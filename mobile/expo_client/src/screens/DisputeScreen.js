import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '../styles/theme';

export const DisputeScreen = ({
  setCurrentScreen,
  isDarkMode,
  
  // Enhanced Cancellation + Rebooking states & triggers
  cancelReasonType,
  setCancelReasonType,
  cancelCustomNote,
  setCancelCustomNote,
  isProviderCancelled,
  rebookingLoading,
  triggerProviderCancellation,

  // Enhanced Complaint/Dispute states & triggers
  complaintCategory,
  setComplaintCategory,
  complaintDescription,
  setComplaintDescription,
  disputeLogs,
  triggerSupportDispute
}) => {
  const styles = useStyles(isDarkMode);

  // Predefined lists
  const cancellationReasons = ['Not available', 'Emergency', 'Out of service area', 'Schedule conflict', 'Other'];
  const complaintCategories = ['Provider behavior', 'Late arrival', 'Wrong service', 'Price issue', 'Cancellation issue', 'Other'];

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('follow_up')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="arrow-back-outline" size={24} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
          <Text style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A', fontWeight: 'bold', fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontWeight: 'bold', fontSize: 16 }}>Dispute & Cancellation Agent</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.scrollContent}>
        {/* Intro */}
        <View style={styles.card}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#06B6D4', marginBottom: 4 }}>⚖️ Support Orchestrator Hub</Text>
          <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13, lineHeight: 18 }}>
            Simulate asynchronous provider cancellations with automated rescue rebooking (Day 2 event), or file complaints post-service (Day 3 event) resolved instantly by our agentic pipeline.
          </Text>
        </View>

        {/* 1. PROVIDER CANCELLATION FLOW */}
        <View style={styles.card}>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: isDarkMode ? '#FFF' : '#0F172A', marginBottom: 2 }}>⚡ Provider Cancellation Simulator</Text>
          <Text style={{ color: '#64748B', fontSize: 11, marginBottom: 12 }}>Simulate provider cancelling the active booking with a reason</Text>

          <Text style={{ color: isDarkMode ? '#94A3B8' : '#475569', fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>Predefined Reason Type:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {cancellationReasons.map((reason) => {
              const selected = cancelReasonType === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setCancelReasonType(reason)}
                  style={{
                    backgroundColor: selected ? 'rgba(6, 182, 212, 0.15)' : (isDarkMode ? '#1E293B' : '#F1F5F9'),
                    borderColor: selected ? '#06B6D4' : 'transparent',
                    borderWidth: 1,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 20
                  }}
                >
                  <Text style={{ color: selected ? '#06B6D4' : (isDarkMode ? '#94A3B8' : '#475569'), fontSize: 11, fontWeight: 'bold' }}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Show input if "Other" selected */}
          {cancelReasonType === 'Other' && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: isDarkMode ? '#94A3B8' : '#475569', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>Custom Provider Note:</Text>
              <TextInput
                style={[styles.input, { height: 40 }]}
                placeholder="e.g. Vehicle breakdown, family emergency..."
                placeholderTextColor="#64748B"
                value={cancelCustomNote}
                onChangeText={setCancelCustomNote}
              />
            </View>
          )}

          {rebookingLoading ? (
            <View style={{ paddingVertical: 12, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#06B6D4" />
              <Text style={{ color: '#06B6D4', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>RESCUING ORDER & REBOOKING...</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: '#EF4444' }]} 
              onPress={triggerProviderCancellation}
              disabled={isProviderCancelled}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                {isProviderCancelled ? '❌ BOOKING RESCUED & REBOOKED' : 'SIMULATE PROVIDER CANCELLATION'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Status Display once cancelled */}
          {isProviderCancelled && (
            <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: 10, borderRadius: 6, marginTop: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 12 }}>🔴 Provider Cancelled Booking</Text>
              <Text style={{ color: isDarkMode ? '#E2E8F0' : '#334155', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
                {cancelReasonType === 'Other' ? `Custom reason: "${cancelCustomNote || 'Vehicle breakdown'}"` : `Reason: "${cancelReasonType}"`}
              </Text>
              <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 11, marginTop: 6 }}>🔄 Status: Rebooked successfully with alternative provider!</Text>
            </View>
          )}
        </View>

        {/* 2. CUSTOMER SUPPORT COMPLAINT / DISPUTE FLOW */}
        <View style={styles.card}>
          <Text style={{ fontSize: 15, fontWeight: 'bold', color: isDarkMode ? '#FFF' : '#0F172A', marginBottom: 2 }}>⚖️ Post-Service Customer Complaint</Text>
          <Text style={{ color: '#64748B', fontSize: 11, marginBottom: 12 }}>Submit complaints directly to our automated pricing & behavior dispute agent</Text>

          <Text style={{ color: isDarkMode ? '#94A3B8' : '#475569', fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>Complaint Category:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {complaintCategories.map((category) => {
              const selected = complaintCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setComplaintCategory(category)}
                  style={{
                    backgroundColor: selected ? 'rgba(6, 182, 212, 0.15)' : (isDarkMode ? '#1E293B' : '#F1F5F9'),
                    borderColor: selected ? '#06B6D4' : 'transparent',
                    borderWidth: 1,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 20
                  }}
                >
                  <Text style={{ color: selected ? '#06B6D4' : (isDarkMode ? '#94A3B8' : '#475569'), fontSize: 11, fontWeight: 'bold' }}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={{ color: isDarkMode ? '#94A3B8' : '#475569', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>Complaint Details:</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: 'top', marginBottom: 12 }]}
            placeholder={complaintCategory === 'Other' ? "Write custom complaint description..." : `Detail description for ${complaintCategory}...`}
            placeholderTextColor="#64748B"
            multiline={true}
            value={complaintDescription}
            onChangeText={setComplaintDescription}
          />

          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: '#06B6D4' }]} 
            onPress={triggerSupportDispute}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>SUBMIT COMPLAINT TO DISPUTE AGENT</Text>
          </TouchableOpacity>
        </View>

        {/* 3. LOG LISTS */}
        {disputeLogs.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>⚖️ Active Support & Dispute Logs</Text>
            {disputeLogs.map((log) => (
              <View key={log.id} style={[styles.card, { borderColor: log.status === 'resolved_auto' ? '#10B981' : '#F59E0B', borderWidth: 1 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: log.status === 'resolved_auto' ? '#10B981' : '#F59E0B', fontWeight: 'bold', fontSize: 12 }}>
                    {log.category.toUpperCase()}
                  </Text>
                  <View style={{ backgroundColor: log.status === 'resolved_auto' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 }}>
                    <Text style={{ color: log.status === 'resolved_auto' ? '#10B981' : '#F59E0B', fontWeight: 'bold', fontSize: 10 }}>
                      {log.status === 'resolved_auto' ? 'RESOLVED AUTO' : 'PENDING REVIEW'}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: isDarkMode ? '#FFF' : '#334155', fontSize: 13, marginTop: 4 }}>Details: "{log.description}"</Text>
                <View style={{ backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', padding: 8, borderRadius: 4, marginTop: 8 }}>
                  <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.8 }}>AGENT RESOLUTION DECISION:</Text>
                  <Text style={{ color: isDarkMode ? '#E2E8F0' : '#475569', fontSize: 12, marginTop: 4, lineHeight: 16 }}>
                    {log.responseMessage}
                  </Text>
                </View>
                <Text style={{ color: '#64748B', fontSize: 9, marginTop: 6, textAlign: 'right' }}>Logged: {log.timestamp}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
