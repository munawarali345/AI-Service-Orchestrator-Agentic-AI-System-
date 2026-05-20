import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStyles } from '../styles/theme';
import { AgentTracePanel } from '../components/AgentTracePanel';

export const AgentTraceScreen = ({
  setCurrentScreen,
  response,
  isDarkMode,
}) => {
  const styles = useStyles(isDarkMode);

  const trace = response?.agent_trace || [];

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('provider_list')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="arrow-back-outline" size={24} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
          <Text style={{ color: isDarkMode ? '#F8FAFC' : '#0F172A', fontWeight: 'bold', fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontWeight: 'bold', fontSize: 16 }}>Agent Trace Reasoning</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={{ color: '#06B6D4', fontWeight: 'bold', fontSize: 14, marginBottom: 6 }}>🧠 Multi-Agent Orchestrator Intelligence</Text>
          <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13, lineHeight: 18 }}>
            This panel visualizes the internal thoughts, constraints, and actions processed by the LangGraph service agents to construct your matching payload.
          </Text>
        </View>

        {/* Dynamic Trace Terminal Panel */}
        <AgentTracePanel trace={trace} isDarkMode={isDarkMode} />

        {/* Static explanations of multi-agents */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>🛠️ Active Agents in our Cluster</Text>
          {[
            { name: "Intent Parser Agent", desc: "Analyzes semantic requests in any language and extracts location, category, date, and urgency metrics." },
            { name: "Discovery Agent", desc: "Performs query expansions to pull matching candidates from database." },
            { name: "Ranking Agent", desc: "Processes 9 distinct variables including geodesic Haversine distance, slots, and provider reliability reviews." }
          ].map((item, i) => (
            <View key={i} style={{ marginTop: i > 0 ? 12 : 0, paddingTop: i > 0 ? 12 : 0, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: isDarkMode ? '#334155' : '#E2E8F0' }}>
              <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 13 }}>{item.name}</Text>
              <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 12, marginTop: 2 }}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
