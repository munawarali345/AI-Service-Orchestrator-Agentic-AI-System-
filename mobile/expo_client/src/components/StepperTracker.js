import React from 'react';
import { View, Text } from 'react-native';
import { useStyles } from '../styles/theme';

export const StepperTracker = ({ schedule, isDarkMode }) => {
  const styles = useStyles(isDarkMode);
  if (!schedule || schedule.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>⏱️ Dynamic Booking Timeline & Reminders</Text>
      {schedule.map((step, index) => (
        <View key={index} style={styles.stepperItem}>
          <View style={styles.stepperBullet} />
          <View style={styles.stepperContent}>
            <Text style={styles.stepperTitle}>{step.state}</Text>
            <Text style={styles.stepperTime}>{new Date(step.timestamp).toLocaleTimeString()}</Text>
            <Text style={styles.cardText}>{step.message}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};
