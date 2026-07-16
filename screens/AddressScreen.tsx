import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux'
import {updatePickUp , updateFocus, updateDestination}from '@/store/features/ride/rideSlice'
import { Icon,CloseCircleIcon } from "@/components/ui/icon"
import { Button, ButtonText } from "@/components/ui/button"
import { Heart } from "lucide-react-native"

import Config from 'react-native-config';

const GOOGLE_API_KEY = Config.GOOGLE_API_KEY || '';

const AddressScreen = props => {
  const [addressType, setaddresstype] = useState('');
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [pickupAddress, setPickupAddress] = useState(null);
  const [destinationAddress, setDistnationAddress] = useState(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const pickup = useSelector((state)=> state.ride.pickup);
  const destination = useSelector((state)=> state.ride.destination);

  useEffect(()=>{
    setPickupAddress(pickup.address)
  }, [pickup])

  useEffect(()=>{
    setDistnationAddress(destination.address)
    console.log(destination.address)
  }, [destination])

  

 const inputFocus = useSelector((state) => state.ride.inputFocus);

  const fetchPredictions = async text => {
    if (text.length > 2) {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_API_KEY}`;
      try {
        const response = await axios.get(url);
        console.log(response.data.predictions)
        setPredictions(response.data.predictions);
      } catch (error) {
        console.error('Error fetching predictions:', error);
      }
    } else {
      setPredictions([]);
    }
  };

  const handleAddressSelect = async placeId => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`;
    try {
      const response = await axios.get(url);
      const address = response.data.result.formatted_address;
      setQuery(address);
      setPredictions([]);
      

      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address,
      )}&key=${GOOGLE_API_KEY}`;
      const geocodeResponse = await axios.get(geocodeUrl);
      const location = geocodeResponse.data.results[0].geometry.location;

      console.log(location)

      if(inputFocus == 'p'){
        dispatch(updatePickUp({
            address,
            lat: location.lat,
            lng: location.lng
          }))
        setPickupAddress(address)
      }
      if(inputFocus == 'd'){
        dispatch(updateDestination({
            address,
            lat: location.lat,
            lng: location.lng
          }))
          setDistnationAddress(address);
          if(pickup.address){
           navigation.goBack()
          }
      }


      console.log('GPS Coordinates:', location);
    } catch (error) {
      console.error('Error fetching address details:', error);
    }
  };

  const openMapScreen = () => {
    navigation.navigate('Map');
  };

  return (
    <SafeAreaView>
    <View style={styles.container}>
     <View style={styles.wrapInput}>
     <TextInput
        style={inputFocus == 'p' ? styles.inputActive : styles.input}
        placeholder="Enter address"
        value={pickupAddress}
        onFocus={()=>
            dispatch(updateFocus('p'))
        }
        onChangeText={text => {
          setPickupAddress(text);
          setQuery(text);
          fetchPredictions(text);
        }}
      />
      <TouchableOpacity style={styles.deleteBtn}  onPress={()=>{
                   setPickupAddress('')
                    dispatch(updatePickUp({
                        address:'',
                        lat: '',
                        lng: ''
                      }))
      }}>
        <Icon as={CloseCircleIcon} className="text-typography-400"  size="xl"/>
      </TouchableOpacity>
     </View>
     <View style={styles.wrapInput}>
     <TextInput
        style={inputFocus == 'd' ? styles.inputActive : styles.input}
        placeholder="Enter address"
        autoFocus={true}
        value={destinationAddress}
        onFocus={()=>
            dispatch(updateFocus('d'))
        }
        onChangeText={text => {
          setDistnationAddress(text);
          setQuery(text);
          fetchPredictions(text);
        }}
      />
      <TouchableOpacity style={styles.deleteBtn} onPress={()=>{
                   setDistnationAddress('')
                    dispatch(updateDestination({
                        address:'',
                        lat: '',
                        lng: ''
                      }))
      }}>
        <Icon as={CloseCircleIcon} className="text-typography-400"  size="xl"/>
      </TouchableOpacity>
     </View>
      {predictions.length > 0 && (
        <FlatList
          data={predictions}
          keyExtractor={item => item.place_id}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => handleAddressSelect(item.place_id)}
              style={{
                position: 'relative',
              }}>
              <View style={{
                paddingRight: 50
              }}>
              <Text style={styles.predictionMainItem}>{item.structured_formatting.main_text}</Text>
              <Text style={styles.predictionItem}>{item.structured_formatting.secondary_text}</Text>
              </View>
              <Icon 
              as={Heart} 
              className="text-typography-500"  
              size="xl"
              style={{
                position: 'absolute',
                right: 10,
                top: 20
              }}/>
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity style={{paddingTop: 20, paddingBottom: 20}} onPress={openMapScreen}>
        <Text style={{ fontSize: 16, color: 'green'} }>العرض علي الخريطه</Text>
      </TouchableOpacity>
      <Button onPress={()=>{
            navigation.goBack()
         }} style={{width: '100%', height: 60}} size="xl" variant="solid" action="positive">
           <ButtonText style={{color: '#fff'}}>Done</ButtonText>
         </Button>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  wrapInput:{
    position: 'relative',
    margin:0,
  },
  deleteBtn:{
    position: 'absolute',
    top: 15,
    right: 10
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 0,
    marginBottom: 16,
    paddingRight: 40,
    paddingLeft: 40,
    borderRadius: 9,
    fontSize: 16
  }, 
  inputActive: {
    height: 50,
    borderColor: 'green',
    borderWidth: 2,
    margin: 0,
    marginBottom: 16,
    paddingRight: 40,
    paddingLeft: 40,
    borderRadius: 9,
    fontSize: 16
  },
  predictionMainItem:{
   padding: 4,
   fontSize: 16,
   fontWeight: 700
  },
  predictionItem: {
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedAddress: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddressScreen;
