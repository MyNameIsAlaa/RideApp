import React from 'react'

import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar"
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button"
import { Divider } from "@/components/ui/divider"
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Pressable } from "@/components/ui/pressable"
import { Text } from "@/components/ui/text"
import { VStack } from "@/components/ui/vstack"
import { Icon, PhoneIcon, StarIcon,MenuIcon, heartIcon } from "@/components/ui/icon"
import { User, Home, ShoppingCart, Wallet, LogOut, Heart,ListCheck } from "lucide-react-native"
import { useDispatch, useSelector } from 'react-redux'
import {toggleMenu}from '@/store/features/settings/settingsSlice'
import {
    View,
    StyleSheet,
    TouchableOpacity
  } from 'react-native';
  import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from '@react-navigation/native'
  

function DrawerScreen() {

    const [showDrawer, setShowDrawer] = React.useState(true)
    const dispatch = useDispatch()
    const menuState = useSelector((state)=> state.settings.menuState);
    const navigation = useNavigation()
  return (
    <Drawer
    isOpen={menuState}
    onClose={() => {
        dispatch(toggleMenu())
    }}
    size="lg"
    anchor="left"
  >
    <DrawerBackdrop />
    <DrawerContent className="p-0">
               <LinearGradient
                colors={["#e3fff7", "#e0ffcc"]}
                style={[{ 
                  width: '100%',
                  height: '100%',
                  borderRadius: 20,
                  opacity: 1
                }]}
              >
      <DrawerHeader className="justify-center flex-col gap-2 p-4">
        <View style={{paddingTop: 50, paddingBottom: 20}}>
        <Avatar size="2xl">
          <AvatarFallbackText>Alaa Adel</AvatarFallbackText>
          <AvatarImage 
            source={{
              uri: "https://i.pravatar.cc/150?u=sjkfhgskj",
            }}
          />
        </Avatar>
        <VStack className="justify-center items-center mt-4">
          <Text size="lg">Alaa Adel</Text>
          <Text size="xl" className="text-typography-600">
           01111805487
          </Text>
        </VStack>
        </View>
      </DrawerHeader>
      <Divider className="my-4" />
      <DrawerBody contentContainerClassName="gap-4 p-4">
        <TouchableOpacity style={styles.menuItem} onPress={()=>{
          navigation.navigate('Profile');
          dispatch(toggleMenu())
        }}>
          <Icon as={User} size="xl" className="text-typography-600" />
          <Text style={styles.menuText}>My Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={()=>{
          navigation.navigate('Addresses');
          dispatch(toggleMenu())
        }}>
          <Icon as={Heart} size="xl" className="text-typography-600" />
          <Text style={styles.menuText}>My Addresses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={()=>{
          navigation.navigate('Trips');
          dispatch(toggleMenu())
        }}>
          <Icon
            as={ListCheck}
            size="xl"
            className="text-typography-600"
          />
          <Text style={styles.menuText}>My Trips</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Icon
            as={PhoneIcon}
            size="xl"
            className="text-typography-600"
          />
          <Text style={styles.menuText}>Contact Us</Text>
        </TouchableOpacity>
      </DrawerBody>
      <DrawerFooter className="flex p-4">
      <VStack className="w-full justify-center items-center gap-4">
      <Button
          size="xl"
          className="w-full gap-2 rounded-full"
          variant="solid"
          action="positive"
        >
          <ButtonText>Driver Mode</ButtonText>
        </Button>

        <Button
          size="xl"
          className="w-full gap-2"
          variant="outline"
          action="secondary"
          onPress={() => {
            dispatch(toggleMenu())
        }}
        >
          <ButtonText>Logout</ButtonText>
          <ButtonIcon as={LogOut} />
        </Button>
        </VStack>
      </DrawerFooter>
      </LinearGradient>
    </DrawerContent>
  </Drawer>
  )
}
const styles = StyleSheet.create({
    menuText:{
        fontSize: 16
    },
    menuItem:{
      flex: 1,
      flexDirection: 'row',
      gap: 20,
      height: 34,
      alignItems: 'center',
    }
})

export default DrawerScreen