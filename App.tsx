/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import './global.css';
import {GluestackUIProvider} from '@/components/ui/gluestack-ui-provider';

import {NavigationContainer} from '@react-navigation/native';
import Routes from './routes';

import {Provider} from 'react-redux';
import store from './store/index';
import Drawer from './screens/Drawer'

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(); // Hides all warnings and errors


function App(): React.JSX.Element {


  return (
    <Provider store={store}>
      <GestureHandlerRootView>
        <GluestackUIProvider mode="light">
          <NavigationContainer>
            <Drawer />
            <Routes />
          </NavigationContainer>
        </GluestackUIProvider>
    </GestureHandlerRootView>
    </Provider>
  );
}

export default App;
