import { StyleSheet, Platform, StatusBar } from 'react-native';

export const getTheme = (isDarkMode) => ({
  background: isDarkMode ? '#0F172A' : '#F8FAFC',
  cardBackground: isDarkMode ? '#1E293B' : '#FFFFFF',
  text: isDarkMode ? '#F8FAFC' : '#0F172A',
  subText: isDarkMode ? '#94A3B8' : '#64748B',
  border: isDarkMode ? '#334155' : '#E2E8F0',
  primary: '#10B981',      // Emerald Green
  secondary: '#06B6D4',    // Cyber Cyan
  accent: '#F59E0B',       // Amber Amber
  errorBackground: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2',
  consoleBackground: isDarkMode ? '#020617' : '#F1F5F9',
  consoleText: isDarkMode ? '#94A3B8' : '#475569',
});

export const useStyles = (isDarkMode) => {
  const t = getTheme(isDarkMode);
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: t.background,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    },
    splashContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: t.background,
    },
    splashLogo: {
      width: 320,
      height: 320,
      marginBottom: -10,
    },
    splashSubtitle: {
      color: t.accent,
      fontSize: 18,
      fontStyle: 'italic',
      marginBottom: 20,
      fontWeight: '600',
    },
    loadingBarContainer: {
      width: 250,
      height: 6,
      backgroundColor: t.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    loadingBarFill: {
      height: '100%',
      borderRadius: 3,
    },
    // Auth screens
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: t.background,
    },
    centerScroll: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: t.background,
    },
    authBrandContainer: {
      alignItems: 'center',
      marginBottom: 20,
      marginTop: -20,
    },
    authLogo: {
      width: 180,
      height: 180,
      marginBottom: -20,
    },
    authWelcome: {
      color: t.text,
      fontSize: 32,
      fontWeight: 'bold',
      marginTop: -5,
    },
    splashSubtitleAuth: {
      color: t.accent,
      fontSize: 15,
      fontStyle: 'italic',
      marginTop: 2,
    },
    authCard: {
      width: '100%',
      backgroundColor: t.cardBackground,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: t.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 20,
      elevation: 8,
    },
    authTitle: {
      color: t.text,
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    inputAuth: {
      backgroundColor: t.background,
      color: t.text,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      borderWidth: 1,
      borderColor: t.border,
      marginBottom: 16,
    },
    validationError: {
      color: '#EF4444',
      marginBottom: 12,
      textAlign: 'center',
      fontWeight: '500',
      fontSize: 14,
    },
    btnRow: {
      flexDirection: 'column',
      gap: 12,
      marginTop: 8,
    },
    primaryBtn: {
      backgroundColor: t.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    primaryBtnText: {
      color: '#0F172A',
      fontWeight: 'bold',
      fontSize: 16,
    },
    secondaryBtn: {
      backgroundColor: t.secondary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    secondaryBtnText: {
      color: '#0F172A',
      fontWeight: 'bold',
      fontSize: 16,
    },
    linkRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    linkText: {
      color: t.subText,
      fontSize: 14,
      textDecorationLine: 'underline',
    },
    // Standard dashboards
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: t.cardBackground,
    },
    headerLogo: {
      height: 48,
      width: 120,
      resizeMode: 'contain',
    },
    headerControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    switchLabel: {
      color: t.text,
      fontSize: 12,
      fontWeight: '600',
    },
    logoutBtnContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    logoutBtnText: {
      color: t.subText,
      fontWeight: '600',
      fontSize: 14,
    },
    themeToggleFloat: {
      position: 'absolute',
      top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      zIndex: 10,
    },
    // Main components
    inputContainer: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
      backgroundColor: t.background,
    },
    input: {
      flex: 1,
      backgroundColor: t.cardBackground,
      color: t.text,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      borderWidth: 1,
      borderColor: t.border,
    },
    mainScroll: {
      flex: 1,
      backgroundColor: t.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
      gap: 16,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      color: t.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      borderLeftWidth: 3,
      borderLeftColor: t.secondary,
      paddingLeft: 8,
    },
    card: {
      backgroundColor: t.cardBackground,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: t.border,
    },
    cardHeader: {
      color: t.text,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    cardText: {
      color: t.subText,
      fontSize: 14,
      marginBottom: 4,
    },
    // Console Debug Agent Trace
    consoleContainer: {
      backgroundColor: t.consoleBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: t.secondary,
      overflow: 'hidden',
      marginBottom: 16,
      height: 250,
    },
    consoleHeader: {
      color: t.secondary,
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 12,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    consoleScroll: {
      padding: 12,
    },
    traceBlock: {
      marginBottom: 12,
    },
    traceAgent: {
      color: t.primary,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontWeight: 'bold',
      marginBottom: 2,
      fontSize: 13,
    },
    traceThought: {
      color: t.consoleText,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      marginBottom: 2,
      fontSize: 12,
    },
    traceAction: {
      color: t.secondary,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 12,
    },
    // Booking confirmation simulated receipt
    receiptRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    receiptTotal: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: t.border,
    },
    receiptTotalText: {
      color: t.primary,
      fontWeight: 'bold',
      fontSize: 16,
    },
    // Timeline follow up Stepper
    stepperItem: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    stepperBullet: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: t.secondary,
      marginTop: 4,
      marginRight: 12,
    },
    stepperContent: {
      flex: 1,
    },
    stepperTitle: {
      color: t.text,
      fontWeight: 'bold',
      fontSize: 15,
    },
    stepperTime: {
      color: t.subText,
      fontSize: 12,
      marginBottom: 4,
    },
    // Dispute styles
    disputeHeader: {
      color: '#EF4444',
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
    },
  });
};
