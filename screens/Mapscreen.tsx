import React, {useState, useEffect} from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { Button, ButtonText } from "@/components/ui/button"
import { useDispatch, useSelector } from 'react-redux'
import {updatePickUp, updateDestination}from '@/store/features/ride/rideSlice'
import { useNavigation } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';

Geocoder.init('AIzaSyAIZsRvrF_6w4nnuhrEX51O060mwTdveBc');

const MapScreen = () => {

  const [region, setRegion] = useState({});
  const [address, setAddress] = useState('');

  const dispatch = useDispatch();
  const navigation = useNavigation();

const inputFocus = useSelector((state) => state.ride.inputFocus);
  

  useEffect(() => {
    getCurrentLocation()
  }, []);


  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const newRegion = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        console.log(newRegion)
        setRegion(newRegion);
        reverseGeocode(newRegion);
      },
      error => {
        console.error('Location error:', error);
        Alert.alert('Error', 'Failed to get current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleMapDrag = (region, gesture) => {
   	if (!gesture.isGesture) return;
      setRegion(region);
      reverseGeocode(region);
  };

  const reverseGeocode = async (region) => {
    try {
      console.log(region)
      const response = await Geocoder.from(region.latitude, region.longitude);
      const address = response.results[0].formatted_address;
      console.log(response)
      setAddress(address);
   
       if(inputFocus =='p'){
        dispatch(updatePickUp({
            address,
            lat: region.latitude,
            lng: region.longitude
          }))
       }
       if(inputFocus =='d'){
        dispatch(updateDestination({
            address,
            lat: region.latitude,
            lng: region.longitude
          }))
       }

    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const DoublePressHandler = async event => {
    const {coordinate} = event.nativeEvent;
    const response = await Geocoder.from(
      coordinate.latitude,
      coordinate.longitude,
    );
    const address = response.results[0].formatted_address;
    setAddress(address);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider='google'
        style={styles.map}
        region={region}
        mapPadding={{ top: 10, right: 10, bottom: 130, left: 10 }}
        onRegionChangeComplete={handleMapDrag}
        onDoublePress={DoublePressHandler}
        showsUserLocation={true}
        showsMyLocationButton={false}
        userInterfaceStyle="dark"
        showsCompass={true}
        zoomTapEnabled={false}>
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
        />
      </MapView>
      <View style={styles.wrapper}>
         <Button onPress={()=>{
            navigation.goBack()
         }} style={{width: '90%', height: 60}} size="xl" variant="solid" action="positive">
           <ButtonText style={{color: '#fff'}}>Done</ButtonText>
         </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1
  },
  map: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  wrapper:{
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default MapScreen;
