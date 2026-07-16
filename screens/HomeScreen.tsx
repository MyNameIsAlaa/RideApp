import React, {useState, useEffect, useRef} from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  FlatList
} from 'react-native';
import MapView, {Marker,Polyline} from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { useNavigation } from '@react-navigation/native';
import {updatePickUp , updateFocus, updateDestination}from '@/store/features/ride/rideSlice'
import { Divider } from "@/components/ui/divider"
import LinearGradient from "react-native-linear-gradient";

import {toggleMenu}from '@/store/features/settings/settingsSlice'

import { useDispatch, useSelector } from 'react-redux'
import polyline from "@mapbox/polyline"; 
import axios from 'axios';
import { Fab, FabLabel, FabIcon } from "@/components/ui/fab"
import Geolocation from '@react-native-community/geolocation';

import { Button, ButtonIcon } from "@/components/ui/button"
import {  MenuIcon, SearchIcon } from "@/components/ui/icon"
import { Spinner } from "@/components/ui/spinner"
import customMapStyle from '../shared/mapStyle.json';

import {
  CircleDot
} from "lucide-react-native"
import { Icon } from "@/components/ui/icon"

import Config from 'react-native-config';

const GOOGLE_API_KEY = Config.GOOGLE_API_KEY || '';

Geocoder.init(GOOGLE_API_KEY);


const HomeScreen = () => {
  const [region, setRegion] = useState({});
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [address, setAddress] = useState('');
  const pickup = useSelector((state)=> state.ride.pickup);
  const destination = useSelector((state)=> state.ride.destination);
  const [mapPadding, setMapPadding] = useState({ top: 20, right: 20, bottom: 120, left: 20 });
  const [coordinates, setCoordinates] = useState([]); 

  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('ready');
  const [durationInMinutes, setDurationInMinutes] = useState(null);
  const [distanceInKm, setDistanceInKm] = useState(null);

  const mapRef = useRef(null);
  const flatListRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    console.log(selectedIndex)
    if (flatListRef.current && selectedIndex < ride_options.length) {
      flatListRef.current.scrollToIndex({
        index: selectedIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [selectedIndex]);

  const ride_options = [
    { 
      status: 1,
      id: "1", 
      label: "Standard", 
      rate:{
        base: 5,
        distance_rate: 6,
        time_rate: 1.5
    } 
   },
    { 
      status: 1,
      id: "2", 
      label: "Premium",      
      rate:{
      base: 5,
      distance_rate: 7,
      time_rate: 1.75
  }  },
    { 
      status: 0,
      id: "3", 
      label: "Bike" ,      
      rate:{
      base: 5,
      distance_rate: 2,
      time_rate: 1
  } },
  ];

  useEffect(() => {
    requestLocationPermission();
    getCurrentLocation();
  }, []);
  

  useEffect(()=>{
       console.log('updating map view')
      if(pickup.address && destination.address){
        setOrderStatus('ready');
        setMapPadding({ top: 20, right: 20, bottom: 350, left: 20 })
      }else{
        setOrderStatus(null)
        setCoordinates([]);
        setMapPadding({ top: 20, right: 20, bottom: 120, left: 20 })
      }
  }, [pickup,destination])

  useEffect(() => {

    const getdestiance = async()=>{
      console.log('location update....')
      const {distance, duration, polylines, distanceInKm, durationInMinutes} = await getRouteDistance(pickup, destination);
      setCoordinates(polylines);
      setDuration(duration);
      setDistance(distance);
      setDistanceInKm(distanceInKm);
      setDurationInMinutes(durationInMinutes)
    }
    if (pickup?.lat && pickup?.lng && destination?.lat && destination?.lng) {
      getdestiance();
    }
  },[pickup,destination])


  const fitMap = ()=>{
    if (pickup?.lat && pickup?.lng && destination?.lat && destination?.lng) {
      if(mapRef.current){
        setTimeout(() => {
          mapRef.current.fitToCoordinates(
            [{
              latitude: pickup.lat,
              longitude: pickup.lng,
            },
            {
              latitude: destination.lat,
              longitude: destination.lng,
            }
          ],
            {              
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            }
          );
        }, 500);
      }
    }
  }

  useEffect(()=>{
    fitMap()
  }, [coordinates])
  


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

  const getRouteDistance = async (origin, destination) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${GOOGLE_API_KEY}`;
      
      const response = await axios.get(url);
      const route = response.data.routes[0];  
      
      const leg = route.legs[0];
      const distanceInMeters = leg.distance.value;
      const durationInSeconds = leg.duration.value;
  
      const distanceInKm = distanceInMeters / 1000;
      const durationInMinutes = durationInSeconds / 60;


      const points = route.overview_polyline.points;
      const decodedPoints = polyline.decode(points).map(([lat, lng]) => ({ latitude: lat, longitude: lng }));


      return {
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        polylines: decodedPoints,
        distanceInKm,
        durationInMinutes,
      };
      
    } catch (error) {
      console.error('Error fetching directions:', error);
      return null;
    }
  };



  const calc_price = (base, d_rate, t_rate)=>{
    const d = distanceInKm;
    const t = durationInMinutes
    const fare = base + (d * d_rate) + (t * t_rate)
    return fare.toFixed(0)
  }

  
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          position => {
            const newRegion = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            };
            setRegion(newRegion);
            reverseGeocode(newRegion);
          },
          error => console.error(error),
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleMapDrag = newRegion => {
    setRegion(newRegion);
    reverseGeocode(newRegion);
  };

  const handleMapDragEnter = () => {
    setAddress('جاري تحديد العنوان...');
  };

  const reverseGeocode = async region => {
    try {
      const response = await Geocoder.from(region.latitude, region.longitude);
      const address = response.results[0].formatted_address;
      setAddress(address);
              dispatch(updatePickUp({
                  address,
                  lat: region.latitude,
                  lng: region.longitude
                }))
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };


  const renderItem = ({ item, index }) => {
    const isSelected = item.id === selectedId;
    return (
      <TouchableOpacity
        disabled={item.status === 0}
        style={[
          {
            flex: 1,
            marginVertical: 2,
          }]}
        onPress={() => {
          setSelectedIndex(index);
          handleSelect(item.id)}}
      >
         <LinearGradient
          colors={isSelected ? ["#e3fff7", "#e0ffcc"] : ["#ffffff", "#ededed"]}
          style={[{ 
            width: '100%',
            height: 80,
            borderRadius: 20,
            opacity: item.status ? 1 : 0.7
          }]}
        >
         <View style={{
          position: 'relative',
          flex: 1,
          padding: 10,
          justifyContent: 'center'
         }}>
         <Text className="font-bold">
          {item.label} 
        </Text>
        {item.status === 0 &&
          <Text className="font-normal text-sm">Coming Soon</Text>
          }
         <Text style ={{
          position: 'absolute',
          top: 25,
          right: 10,
          
          fontSize: 16
         }}>{calc_price(item.rate.base,item.rate. distance_rate, item.rate.time_rate)} EGP</Text>
         </View>
        </LinearGradient>
      </TouchableOpacity>
    );    
  };

  const handleSelect = (id) => {
    setSelectedId(id);
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

     <Button onPress={()=>{
      dispatch(toggleMenu())
     }} style={styles.menuBtn} action="primary" size="lg" className="rounded-full p-3.5">
      <ButtonIcon as={MenuIcon} />
    </Button>

      <MapView
        key={coordinates.length}
        provider='google'
        ref={mapRef}
        mapPadding={mapPadding}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        userInterfaceStyle="dark"
        showsCompass={true}
        zoomTapEnabled={false}
        onMapLoaded={fitMap}
        onMapReady={fitMap}
        customMapStyle={customMapStyle}
      >
        <Marker
          coordinate={{
            latitude: pickup.lat,
            longitude: pickup.lng,
          }}
        />
        <Marker
          coordinate={{
            latitude: destination.lat,
            longitude: destination.lng,
          }}
        />

        {/* Draw Route */}
          {coordinates.length > 0 && (
             <Polyline coordinates={coordinates} strokeWidth={8} strokeColor="#7fc2b0"  strokeColors={[
              '#53c40c',
              '#0991e0',
            ]} />
           )}


      </MapView>

      <View style={styles.infoContainer}>
      {orderStatus == null && 
        <View style={[styles.infoBox, styles.shadowContainer]}>
          <View style={{
            position: 'relative'
          }}>
          <Icon style={{
            position: 'absolute',
            top: 15,
            left: 14,
            color: '#53c40c',
            zIndex: 9999,
          }} as={CircleDot}></Icon>
          <Text numberOfLines={1} className='text-typography-900' ellipsizeMode='tail' style={styles.textLocation3} onPress={()=>navigation.navigate('Address')}>{pickup.address}</Text>
          </View>
          <View style={{
            position: 'relative',
          }}>
          <Icon style={{
            position: 'absolute',
            top: 15,
            left: 14,
            color: '#0991e0',
            zIndex: 9999,
          }} as={SearchIcon}></Icon>
          <Text numberOfLines={1} className='text-typography-600' ellipsizeMode='tail' style={[styles.textLocation2]} onPress={()=>navigation.navigate('Address')}>{destination.address || 'Where To Go.'}</Text>
          </View>

        </View>
        }
      {orderStatus == 'ready' && 
        <View style={[styles.infoBox, styles.shadowContainer]}>
          <View style={{
            position: 'relative'
          }}>
          <Icon style={{
            position: 'absolute',
            top: 6,
            left: 6,
            color: '#53c40c'
          }} as={CircleDot}></Icon>
          <Text numberOfLines={1} ellipsizeMode='tail' style={styles.textLocation} onPress={()=>navigation.navigate('Address')}>{pickup.address}</Text>
          </View>
          <View style={{
            position: 'relative',
          }}>
          <Icon style={{
            position: 'absolute',
            top: 6,
            left: 6,
            color: '#0991e0'
          }} as={CircleDot}></Icon>
          <Text numberOfLines={1} ellipsizeMode='tail' style={styles.textLocation} onPress={()=>navigation.navigate('Address')}>{destination.address}</Text>
          </View>


          <Divider />

             <View style={{
              flex:1,
              flexDirection: 'row',
              height: 40,
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 6
             }}>
               <View><Text>{distance} ~{duration}</Text></View>
              <View><Text className="font-bold">Payment: <Text>Cash</Text></Text></View>
              </View>

              <Divider />

          <View style={{
            height: 160,
            borderRadius: 10,
          }}>
          <FlatList
          ref={flatListRef}
        data={ride_options}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
      />
            </View>
          <TouchableOpacity
          onPress={()=> setOrderStatus('pending')}
          style={{
            backgroundColor: selectedId ? '#c3f030' : 'gray',
            opacity: selectedId ? 1 : 0.35,
            borderColor: '#fff',
            borderWidth: 1,
            padding: 14,
            alignItems: 'center',
            borderRadius: 100,
            shadowColor: "gray",
            shadowOffset: {
              width: 0,
              height: -10,
            },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 1,
          }}><Text style={{
            fontSize: 24,
            fontWeight:'bold'
          }}>Request</Text></TouchableOpacity>


        </View>
        }


      {orderStatus == 'pending' &&
         <View style={[styles.infoBox, styles.shadowContainer]}>
          <View style={{
            flex:1,
            flexDirection:'column',
            padding: 60,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text className="text-lg font-bold">Confirming Your Ride...</Text>
            <Spinner size="large" color={'gray'} />
          </View>
          <TouchableOpacity
          onPress={()=> setOrderStatus('ready')}
          style={{
            backgroundColor: selectedId ? '#c3f030' : 'gray',
            borderColor: '#fff',
            borderWidth: 1,
            padding: 14,
            alignItems: 'center',
            borderRadius: 100,
            shadowColor: "#89b300",
            shadowOffset: {
              width: 0,
              height: -10,
            },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 1,
          }}><Text style={{
            fontSize: 24,
            fontWeight:'bold'
          }}>Cancel</Text></TouchableOpacity>
         </View>
      }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1
  },
  menuBtn:{
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 9999,
    width: 50,
    height: 50
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 40,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox:{
    flex: 1,
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
  },
  shadowContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  inputbox:{
    borderColor: '#e8e8e8',
    borderWidth: 2,
    borderRadius: 9,
    height: 50,
    backgroundColor: '#fff',
    color: '#39803d',
    justifyContent: 'center',
    fontSize: 20,
    padding: 9,
    margin: 6
  },
  textLocation:{
    fontSize: 14,
    height: 36,
    padding: 6,
    paddingLeft: 40,
    paddingRight: 9,
    alignItems: 'center',
  },
  textLocation2:{
    fontSize: 20,
    height: 44,
    padding: 8,
    paddingLeft: 40,
    paddingRight: 9,
    borderRadius:10,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    margin: 2
  },
  textLocation3:{
    fontSize: 20,
    height: 44,
    padding: 8,
    paddingLeft: 40,
    paddingRight: 9,
    borderRadius:10,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 2
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    right: 10,
    zIndex: 10,
  },
});

export default HomeScreen;
