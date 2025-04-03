import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Camera } from "expo-camera";
import { Avatar } from "react-native-paper";
import { colors, defaultStyle } from "../styles/styles";
import * as ImagePicker from "expo-image-picker";

const CameraComponent = ({ navigation, route }) => {
  const [hasPermission, setHasPermission] = useState(null);

  const handleBack = () => {
    navigation?.goBack();
  };

  const openImagePicker = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false)
        return alert("Permission to access gallery is required");

      const data = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      
      if (data.canceled || !data.assets || data.assets.length === 0) return;

      const imageUri = data.assets[0].uri;
      
      if (route.params?.newProduct)
        return navigation.navigate("newproduct", { image: imageUri });
      if (route.params?.updateProduct)
        return navigation.navigate("productimages", { image: imageUri });
      if (route.params?.updateProfile)
        return navigation.navigate("profile", { image: imageUri });
      if (route.params?.newCategory)
        return navigation.navigate("categories", { image: imageUri });
      
      return navigation.navigate("signup", { image: imageUri });
    } catch (error) {
      console.log("Error in image picker:", error);
      alert("Failed to pick image");
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const imageUri = result.assets[0].uri;
      
      if (route.params?.newProduct)
        return navigation.navigate("newproduct", { image: imageUri });
      if (route.params?.updateProduct)
        return navigation.navigate("productimages", { image: imageUri });
      if (route.params?.updateProfile)
        return navigation.navigate("profile", { image: imageUri });
      if (route.params?.newCategory)
        return navigation.navigate("categories", { image: imageUri });
      
      return navigation.navigate("signup", { image: imageUri });
    } catch (error) {
      console.log("Error taking picture:", error);
      alert("Failed to take picture");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (error) {
        console.log("Error requesting camera permission:", error);
        setHasPermission(false);
      }
    })();
  }, []);

  if (hasPermission === null) {
    return <View style={defaultStyle}><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return (
      <View style={defaultStyle}>
        <Text>No access to camera</Text>
        <TouchableOpacity 
          style={{ 
            marginTop: 20,
            backgroundColor: colors.color1,
            padding: 10,
            borderRadius: 5
          }}
          onPress={handleBack}
        >
          <Text style={{ color: colors.color2 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.color2 }}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1,
            padding: 10,
          }}
          onPress={handleBack}
        >
          <Avatar.Icon
            icon="arrow-left"
            size={30}
            color={colors.color2}
            style={{
              backgroundColor: colors.color4,
            }}
          />
        </TouchableOpacity>

        <View style={{ 
          flex: 1, 
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.color1,
              padding: 15,
              borderRadius: 8,
              marginVertical: 10,
              width: '100%',
              alignItems: 'center'
            }}
            onPress={openImagePicker}
          >
            <Text style={{ color: colors.color2, fontSize: 16 }}>Pick from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.color1,
              padding: 15,
              borderRadius: 8,
              marginVertical: 10,
              width: '100%',
              alignItems: 'center'
            }}
            onPress={openCamera}
          >
            <Text style={{ color: colors.color2, fontSize: 16 }}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CameraComponent;
