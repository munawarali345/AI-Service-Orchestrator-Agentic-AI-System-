import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { useStyles } from './src/styles/theme';
import { useOrchestrator } from './src/controllers/useOrchestrator';

// Import Screens
import { SplashScreen } from './src/screens/SplashScreen';
import { AuthChoiceScreen } from './src/screens/AuthChoiceScreen';
import { SignupUserScreen } from './src/screens/SignupUserScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProviderListScreen } from './src/screens/ProviderListScreen';
import { ProviderDetailScreen } from './src/screens/ProviderDetailScreen';
import { BookingConfirmationScreen } from './src/screens/BookingConfirmationScreen';
import { FollowUpScreen } from './src/screens/FollowUpScreen';
import { AgentTraceScreen } from './src/screens/AgentTraceScreen';
import { DisputeScreen } from './src/screens/DisputeScreen';
import { BaselineCompareScreen } from './src/screens/BaselineCompareScreen';

export default function App() {
  const orchestrator = useOrchestrator();
  const styles = useStyles(orchestrator.isDarkMode);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle={orchestrator.isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={orchestrator.isDarkMode ? '#0F172A' : '#F8FAFC'} 
      />

      {/* 1. Splash Screen */}
      {orchestrator.currentScreen === 'splash' && (
        <SplashScreen 
          setCurrentScreen={orchestrator.setCurrentScreen} 
          isDarkMode={orchestrator.isDarkMode} 
        />
      )}

      {/* 2. Authentication Choice Screen */}
      {orchestrator.currentScreen === 'auth_choice' && (
        <AuthChoiceScreen 
          setCurrentScreen={orchestrator.setCurrentScreen} 
          isDarkMode={orchestrator.isDarkMode} 
          setIsDarkMode={orchestrator.setIsDarkMode}
          handleLogin={orchestrator.handleLogin}
          authError={orchestrator.authError}
          authLoading={orchestrator.authLoading}
        />
      )}

      {/* 3. Signup Screens */}
      {orchestrator.currentScreen === 'signup_user' && (
        <SignupUserScreen 
          setCurrentScreen={orchestrator.setCurrentScreen} 
          isDarkMode={orchestrator.isDarkMode} 
          handleRegisterUser={orchestrator.handleRegisterUser}
          authLoading={orchestrator.authLoading}
          authError={orchestrator.authError}
        />
      )}


      {/* 4. Home Screen */}
      {orchestrator.currentScreen === 'home' && (
        <HomeScreen 
          setCurrentScreen={orchestrator.setCurrentScreen}
          query={orchestrator.query}
          setQuery={orchestrator.setQuery}
          userLocation={orchestrator.userLocation}
          setUserLocation={orchestrator.setUserLocation}
          loading={orchestrator.loading}
          handleExecute={orchestrator.handleExecute}
          isDarkMode={orchestrator.isDarkMode}
          setIsDarkMode={orchestrator.setIsDarkMode}
          devMode={orchestrator.devMode}
          setDevMode={orchestrator.setDevMode}
          handleLogout={orchestrator.handleLogout}
        />
      )}

      {/* 5. Provider List Screen */}
      {orchestrator.currentScreen === 'provider_list' && (
        <ProviderListScreen 
          setCurrentScreen={orchestrator.setCurrentScreen}
          response={orchestrator.response}
          setSelectedDetail={orchestrator.setSelectedDetail}
          isDarkMode={orchestrator.isDarkMode}
          setIsDarkMode={orchestrator.setIsDarkMode}
          devMode={orchestrator.devMode}
          setDevMode={orchestrator.setDevMode}
          handleLogout={orchestrator.handleLogout}
          runBaselineComparison={orchestrator.runBaselineComparison}
        />
      )}

      {/* 6. Provider Detail Screen */}
      {orchestrator.currentScreen === 'provider_detail' && (
        <ProviderDetailScreen 
          setCurrentScreen={orchestrator.setCurrentScreen}
          selectedDetail={orchestrator.selectedDetail}
          isDarkMode={orchestrator.isDarkMode}
        />
      )}

      {/* 7. Booking Confirmation Screen */}
      {orchestrator.currentScreen === 'booking_confirmation' && (
        <BookingConfirmationScreen 
          setCurrentScreen={orchestrator.setCurrentScreen}
          response={orchestrator.response}
          isDarkMode={orchestrator.isDarkMode}
        />
      )}

      {/* 8. Follow-up Timeline Screen */}
      {orchestrator.currentScreen === 'follow_up' && (
        <FollowUpScreen 
          setCurrentScreen={orchestrator.setCurrentScreen}
          response={orchestrator.response}
          isDarkMode={orchestrator.isDarkMode}
        />
      )}

      {/* 9. Developer Agent Trace Screen */}
      {orchestrator.currentScreen === 'agent_trace' && (
        <AgentTraceScreen 
          setCurrentScreen={orchestrator.setCurrentScreen}
          response={orchestrator.response}
          isDarkMode={orchestrator.isDarkMode}
        />
      )}

      {/* 10. Disputes and Cancellation Screen */}
      {orchestrator.currentScreen === 'dispute' && (
        <DisputeScreen 
          setCurrentScreen={orchestrator.setCurrentScreen}
          isDarkMode={orchestrator.isDarkMode}
          cancelReasonType={orchestrator.cancelReasonType}
          setCancelReasonType={orchestrator.setCancelReasonType}
          cancelCustomNote={orchestrator.cancelCustomNote}
          setCancelCustomNote={orchestrator.setCancelCustomNote}
          isProviderCancelled={orchestrator.isProviderCancelled}
          rebookingLoading={orchestrator.rebookingLoading}
          triggerProviderCancellation={orchestrator.triggerProviderCancellation}
          complaintCategory={orchestrator.complaintCategory}
          setComplaintCategory={orchestrator.setComplaintCategory}
          complaintDescription={orchestrator.complaintDescription}
          setComplaintDescription={orchestrator.setComplaintDescription}
          disputeLogs={orchestrator.disputeLogs}
          triggerSupportDispute={orchestrator.triggerSupportDispute}
        />
      )}

      {/* 11. Side-by-Side Baseline Comparison Screen */}
      {orchestrator.currentScreen === 'baseline_compare' && (
        <BaselineCompareScreen 
          setCurrentScreen={orchestrator.setCurrentScreen}
          baselineData={orchestrator.baselineData}
          isDarkMode={orchestrator.isDarkMode}
        />
      )}


    </SafeAreaView>
  );
}
