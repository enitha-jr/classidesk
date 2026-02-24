import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        user_id: null,
        username: null,
        email: null,
        role: null,
        exp: null,
    },
    reducers: {
        setAuth: (state, action) => {
            state.token = action.payload.token
            state.user_id = action.payload.user_id
            state.username = action.payload.username
            state.email = action.payload.email
            state.role = action.payload.role
            state.exp = action.payload.exp
        },
        clearAuth: () => {
            return {
                token: null,
                user_id: null,
                username: null,
                email: null,
                role: null,
                exp: null,
            };
        }
    },


})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer;