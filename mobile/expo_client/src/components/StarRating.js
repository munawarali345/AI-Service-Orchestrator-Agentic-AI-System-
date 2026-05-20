import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useStyles } from '../styles/theme';

export const StarRating = ({ isDarkMode }) => {
  const styles = useStyles(isDarkMode);
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Selection Required', 'Please select a star rating first!');
      return;
    }
    Alert.alert('Thank You!', `Aapka ${rating}-star feedback dynamic feedback agent ko submit ho gaya hai!`);
    setRating(0);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>⭐ Rate Your Service Quality</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 16 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={{
              fontSize: 40,
              color: star <= rating ? '#FDE047' : '#BDC3C7',
              textShadowColor: star <= rating ? 'rgba(253, 224, 71, 0.6)' : 'transparent',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10,
            }}>
              {star <= rating ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={[styles.primaryBtn, { paddingVertical: 10 }]} onPress={handleSubmit}>
        <Text style={styles.primaryBtnText}>Submit Quality Feedback</Text>
      </TouchableOpacity>
    </View>
  );
};
