import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, SafeAreaView } from 'react-native';

const AboutScreen: React.FC = () => {
  const handleReportIssue = () => {
    Linking.openURL('mailto:glootieapp@gmail.com?subject=Open%20Mat%20Finder%20Feedback');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About JiuJitsu Finder</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your BJJ Training Companion</Text>
          <Text style={styles.sectionText}>Find open mat sessions in your area with real-time data from our GitHub integration.</Text>
          <Text style={styles.sectionText}>Currently serving Austin and Tampa with more cities coming soon.</Text>
          <Text style={styles.sectionText}>Help us improve by reporting any issues or suggesting new features.</Text>
          <Text style={styles.sectionText}>Current version: <Text style={styles.version}>v1.0.0</Text></Text>
        </View>
        <TouchableOpacity style={styles.reportButton} onPress={handleReportIssue}>
          <Text style={styles.reportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: '#222',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
    width: '100%',
  },
  sectionTitle: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
    textAlign: 'center',
  },
  version: {
    color: '#2563EB',
    fontWeight: '700',
  },
  reportButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  reportButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

export default AboutScreen; 