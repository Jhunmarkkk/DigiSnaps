import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { login, googleLogin } from '../redux/actions/userAction';
import GoogleButton from '../components/GoogleButton';
import { useGoogleSignIn } from '../utils/googleSignIn';
import { PrimaryButton } from '../components/Button';
import { showToast } from '../utils/showToast';
import CustomTextInput from '../components/CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { signIn, userInfo, loading: googleLoading, error: googleError } = useGoogleSignIn();
  
  // Handle Google Sign-In response
  useEffect(() => {
    const handleGoogleAuth = async () => {
      if (userInfo) {
        try {
          console.log("Google auth succeeded, user info:", userInfo);
          
          // Add a delay to ensure userInfo is fully populated
          setTimeout(async () => {
            try {
              // Google authentication succeeded, call our backend API
              await dispatch(googleLogin(null, userInfo));
            } catch (delayedError) {
              console.error("Error during delayed Google login dispatch:", delayedError);
              showToast(delayedError.message || 'Google sign-in failed');
            }
          }, 500);
        } catch (error) {
          console.error("Error during Google login dispatch:", error);
          showToast(error.message || 'Google sign-in failed');
        }
      }
    };
    
    handleGoogleAuth();
  }, [userInfo, dispatch]);
  
  // Handle Google Sign-In errors
  useEffect(() => {
    if (googleError) {
      console.error("Google sign-in error:", googleError);
      showToast(googleError);
    }
  }, [googleError]);

  const handleSubmit = async () => {
    if (!email || !password) {
      showToast('Please fill all the fields');
      return;
    }

    try {
      setLoading(true);
      await dispatch(login(email, password));
    } catch (error) {
      showToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log("Starting Google sign-in...");
      
      // Clear any previous session data first
      await AsyncStorage.removeItem('googleAuth');
      await AsyncStorage.removeItem('googleCredentials');
      
      // Now trigger the sign-in flow
      await signIn();
    } catch (error) {
      console.error("Error initiating Google sign-in:", error);
      showToast(error.message || "Failed to start Google sign-in");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
        
        <CustomTextInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <CustomTextInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Login"
            onPress={handleSubmit}
            loading={loading}
          />
        </View>
        
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.divider} />
        </View>
        
        <View style={styles.socialButtonsContainer}>
          <GoogleButton 
            onPress={handleGoogleSignIn} 
            loading={googleLoading} 
            disabled={loading} 
          />
          
          <TouchableOpacity 
            style={styles.switchAccount}
            onPress={async () => {
              await AsyncStorage.setItem('forceNewGoogleLogin', 'true');
              await AsyncStorage.removeItem('googleAuth');
              await AsyncStorage.removeItem('googleCredentials');
              handleGoogleSignIn();
            }}
          >
            <Text style={styles.switchAccountText}>Use different Google account</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.signupContainer}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupLink}>Signup</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4285F4',
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 10,
    color: '#757575',
    fontWeight: '600',
  },
  socialButtonsContainer: {
    marginBottom: 20,
  },
  signupContainer: {
    alignItems: 'center',
  },
  signupText: {
    color: '#333',
  },
  signupLink: {
    color: '#4285F4',
    fontWeight: 'bold',
  },
  switchAccount: {
    alignItems: 'center',
    marginTop: 10,
  },
  switchAccountText: {
    color: '#4285F4',
    fontWeight: '600',
  },
});

export default LoginScreen; 