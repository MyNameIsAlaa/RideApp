import { configureStore } from "@reduxjs/toolkit";
import rideSlice from './features/ride/rideSlice'
import settingsSlice from './features/settings/settingsSlice';
const store = configureStore({
    reducer:{
        ride: rideSlice,
        settings: settingsSlice
    }
})

export default store;