import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity,SafeAreaView,ImageBackground,StyleSheet } from "react-native";
import CountryPicker, { Country } from "react-native-country-picker-modal";
import { useNavigation } from '@react-navigation/native';
import LinearGradient from "react-native-linear-gradient";



function PhoneScreen() {

  const [countryCode, setCountryCode] = useState("EG");
  const [country, setCountry] = useState<Country | null>(null);
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
 
  return (


  <LinearGradient colors={['#d9ffe3', '#f1ffc2']}  
  style={{
    height: '100%',
    width: '100%',
  }}>

      <View style={styles.overlay}>
        <View style={{
                position: 'absolute',
                top: 400,
                left: 0,
                width: '100%',
                justifyContent: "center",
                alignItems: "center",
        }}>
      <View style={{ 
      flexDirection: 'row', 
      height: 60, 
      width: 350, 
      padding: 9, 
      borderRadius: 9,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: 'rgba(255,255,255,0.6)', }}>

      <CountryPicker
        withFilter
        withFlag
        withCallingCode
        withEmoji
        withFlagButton
        withCallingCodeButton
        visible={visible}
        onSelect={(selectedCountry) => {
          setCountryCode(selectedCountry.cca2);
          setCountry(selectedCountry);
          setVisible(false);
        }}
        onClose={() => setVisible(false)}
        countryCode={countryCode}
      />
      <TextInput 
      keyboardType="phone-pad"
      style={{
        flex:1,
        fontSize: 18,
        padding: 10,
      }} placeholder="Enter Phone Number"/>
    </View>
    <TouchableOpacity 
    onPress={()=> navigation.navigate('Home')}
    style={{
      backgroundColor: '#c3f030',
      marginTop: 20,
      height: 60,
      width: 350,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 9,
    }}>
      <Text className="text-xl font-bold">Continue</Text>
    </TouchableOpacity>
        </View>

      </View>

  </LinearGradient>

  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    width: "100%",
    height: "100%",
    position: 'absolute',
  },
  text: {
    color: "#fff",
    fontSize: 20,
  },
});
export default PhoneScreen;