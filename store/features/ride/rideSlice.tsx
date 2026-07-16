import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    inputFocus: 'p',
    pickup: {
        address: '',
        lat: -100,
        lng: -100,
    },
    destination: {
        address: '',
        lat: '',
        lng: ''
    }
}
const rideSlice = createSlice({
    name: 'Ride',
    initialState,
    reducers:{
        updatePickUp: (state, action)=>{
            state.pickup= action.payload;
        },
        updateDestination: (state, action)=>{
            state.destination = action.payload;
        },
        updateFocus: (state, action)=>{
            state.inputFocus = action.payload
        }
    }
})


export default rideSlice.reducer;
export const { updatePickUp,updateDestination, updateFocus } = rideSlice.actions