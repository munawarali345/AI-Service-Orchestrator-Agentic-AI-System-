import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useStyles } from '../styles/theme';

export const AgentTracePanel = ({ trace, isDarkMode }) => {
  const styles = useStyles(isDarkMode);
  if (!trace || trace.length === 0) return null;

  return (
    <View style={styles.consoleContainer}>
      <Text style={styles.consoleHeader}>⚡ Real-Time Multi-Agent Trace</Text>
      <ScrollView style={styles.consoleScroll} nestedScrollEnabled={true}>
        {trace.map((item, index) => (
          <View key={index} style={styles.traceBlock}>
            <Text style={styles.traceAgent}>🤖 [{item.agent}]</Text>
            <Text style={styles.traceThought}>🧠 Thought: {item.thought}</Text>
            <Text style={styles.traceAction}>⚙️ Action: {item.action}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
