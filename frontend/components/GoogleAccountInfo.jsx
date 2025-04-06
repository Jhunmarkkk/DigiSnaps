import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../styles/styles';

const GoogleAccountInfo = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to get user data from storage
      const rawUserData = await AsyncStorage.getItem('googleRawUserData');
      const userData = await AsyncStorage.getItem('googleUserData');
      
      if (rawUserData && userData) {
        const parsedRawData = JSON.parse(rawUserData);
        const parsedUserData = JSON.parse(userData);
        
        setUserData({
          name: parsedUserData.name || parsedRawData.name || 'Unknown',
          email: parsedUserData.email || parsedRawData.email || 'Unknown',
          id: parsedUserData._id || parsedRawData.id || 'Unknown',
          photo: parsedRawData.photo || (parsedUserData.avatar && parsedUserData.avatar.url) || null
        });
      } else {
        setUserData(null);
      }
    } catch (err) {
      console.error('Error loading Google user data:', err);
      setError('Failed to load user data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Google Account</Text>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Google Account</Text>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return;
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    margin: 10,
    backgroundColor: colors.color4,
    borderRadius: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.color3,
  },
  statusText: {
    color: 'green',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: colors.color3,
    marginBottom: 5,
  },
  id: {
    fontSize: 12,
    color: colors.color3,
    marginBottom: 5,
  },
  notConnected: {
    color: '#999',
  },
  loading: {
    color: '#666',
    fontStyle: 'italic',
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
  buttonContainer: {
    marginVertical: 15,
  },
});

export default GoogleAccountInfo;
