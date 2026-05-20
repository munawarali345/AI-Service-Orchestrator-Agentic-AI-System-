import React from 'react';
import { View, Text, Image } from 'react-native';
import { useStyles } from '../styles/theme';

export const DynamicReceipt = ({ receipt, isDarkMode }) => {
  const styles = useStyles(isDarkMode);
  if (!receipt) return null;

  return (
    <View style={styles.card}>
      <View style={styles.receiptHeader}>
        <Image source={require('../../assets/Hazir_logoD.png')} style={styles.receiptLogo} resizeMode="contain" />
        <Text style={[styles.cardHeader, { marginBottom: 0 }]}>Dynamic Proximity Receipt</Text>
      </View>
      
      <View style={styles.receiptRow}>
        <Text style={styles.cardText}>Base Service Fee</Text>
        <Text style={styles.cardText}>PKR {receipt.base_fee}</Text>
      </View>
      
      <View style={styles.receiptRow}>
        <Text style={styles.cardText}>Distance Proximity Fee</Text>
        <Text style={styles.cardText}>PKR {receipt.distance_fee}</Text>
      </View>
      
      <View style={styles.receiptRow}>
        <Text style={styles.cardText}>Urgency Surge Charge</Text>
        <Text style={styles.cardText}>PKR {receipt.urgency_surge}</Text>
      </View>
      
      <View style={styles.receiptRow}>
        <Text style={styles.cardText}>Proximity Route Discount</Text>
        <Text style={styles.cardText}>-PKR {receipt.discount}</Text>
      </View>
      
      <View style={[styles.receiptRow, styles.receiptTotal]}>
        <Text style={styles.receiptTotalText}>Grand Total</Text>
        <Text style={styles.receiptTotalText}>PKR {receipt.grand_total}</Text>
      </View>
    </View>
  );
};
