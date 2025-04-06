import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/actions/userAction';
import { MaterialIcons } from '@expo/vector-icons';

const SwitchGoogleAccount = ({ style }) => {
  const dispatch = useDispatch();

  const handleSwitchAccount = async () => {
    // Log out with the forceNewGoogleLogin flag set to true
    await dispatch(logout(true));
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handleSwitchAccount}
    >
      <MaterialIcons name="switch-account" size={18} color="#4285F4" />
      <Text style={styles.text}>Switch Google Account</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginVertical: 8,
  },
  text: {
    color: '#4285F4',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SwitchGoogleAccount; 