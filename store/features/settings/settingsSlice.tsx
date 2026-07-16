import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    menuState: false,
    language: 'eng'
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        toggleMenu(state, action){
            state.menuState = !state.menuState
        }
    }
})


export default settingsSlice.reducer;
export const { toggleMenu } = settingsSlice.actions;