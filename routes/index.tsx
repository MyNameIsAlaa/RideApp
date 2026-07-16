import HomeScreen from '@/screens/HomeScreen';
import AddressScreen from '@/screens/AddressScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Mapscreen from '@/screens/Mapscreen';
import PhoneScreen from '@/screens/PhoneScreen';
import MapScreen from '@/screens/Mapscreen';
import TripsScreen from '@/screens/TripsScreen';
import AddressesScreen from '@/screens/AddressesScreen';
import ProfileScreen from '@/screens/ProfileScreen';
const Stack = createNativeStackNavigator();

const Routes = () => {
  return (
    <Stack.Navigator initialRouteName="Phone" screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Welcome'}}
      />
      <Stack.Screen
        name="Address"
        component={AddressScreen}
        options={{
        title: 'Address', 
         }}
      />
    <Stack.Screen
    name="Phone"
    component={PhoneScreen}
    options={{
    title: 'Phone', 
     }}
  />
      <Stack.Screen name="Map" component={Mapscreen}  />
      <Stack.Screen name="Trips" component={TripsScreen} options={{
        title: 'My Trips',
        headerShown: true,
        headerBackTitle: 'Back'
      }} />
      <Stack.Screen name="Addresses" component={AddressesScreen} options={{
        title: 'My Addresses',
        headerShown: true,
        headerBackTitle: 'Back'
      }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{
        title: 'My Profile',
        headerShown: true,
        headerBackTitle: 'Back'
      }} />
    </Stack.Navigator>
  );
};

export default Routes;
