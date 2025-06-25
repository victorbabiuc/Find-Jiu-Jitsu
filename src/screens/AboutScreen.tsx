import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, SafeAreaView } from 'react-native';

const AboutScreen: React.FC = () => {
  const handleReportIssue = () => {
    Linking.openURL('mailto:support@openmatfinder.com?subject=Open%20Mat%20Finder%20Beta%20Feedback');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.betaBadge}><Text style={styles.betaBadgeText}>BETA</Text></View>
        <Text style={styles.title}>About Open Mat Finder</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beta Notice</Text>
          <Text style={styles.sectionText}>This is a beta version of Open Mat Finder.</Text>
          <Text style={styles.sectionText}>We're actively adding more cities and features.</Text>
          <Text style={styles.sectionText}>Help us improve by reporting any issues.</Text>
          <Text style={styles.sectionText}>Current version: <Text style={styles.version}>v0.1.0-beta</Text></Text>
        </View>
        <TouchableOpacity style={styles.reportButton} onPress={handleReportIssue}>
          <Text style={styles.reportButtonText}>Report Issue</Text>
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
  betaBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    alignItems: 'center',
    marginBottom: 16,
  },
  betaBadgeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1,
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
    color: '#F59E0B',
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
    color: '#F59E0B',
    fontWeight: '700',
  },
  reportButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  reportButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

export default AboutScreen; 