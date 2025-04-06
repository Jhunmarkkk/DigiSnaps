import React from 'react';
import { TouchableOpacity, Text, Image, View, StyleSheet, ActivityIndicator } from 'react-native';

const GoogleButton = ({ onPress, loading = false, disabled = false }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, disabled && styles.disabledButton]} 
      onPress={onPress} 
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <View style={styles.buttonContent}>
          <Image 
            source={require('../assets/google-logo.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: '#A4C2F4',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
});

export default GoogleButton; 