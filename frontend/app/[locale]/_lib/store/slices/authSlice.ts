import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/_lib/axios/axios'
import axios from 'axios'

api.defaults.withCredentials = true // always send cookies

/* ---------- async bootstrap ---------- */
export const bootstrapAuth = createAsyncThunk(
  'auth/bootstrap',
  async (_, { rejectWithValue }) => {
    try {
      let res = await api.post('/user/token/verify/')
      console.log('Token verification response:', res)
      if (res.data.valid === false) {
        await axios.post(
          'http://127.0.0.1:8000/api/user/token/refresh/',
          {},
          { withCredentials: true }
        )
      }
      res = await api.post('/user/token/verify/')
      if (res.data.valid === false)
        return rejectWithValue(null)
      return {...res.data, isAuthenticated: true}
    } catch {
      return rejectWithValue(null)
    }
  }
)

interface AuthState {
  isAuthenticated: boolean
  email: string | null
  role: string | null
  isInitialized : Boolean | null // Track if auth state is initialized
}

const initialState: AuthState = {
  isAuthenticated: false,
  email: null,
  role: null,
  isInitialized: false, // Start as not initialized
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true
      state.email = action.payload.email
      state.role = action.payload.role
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.email = state.role = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        console.log('Auth bootstrap successful:', action.payload)
        state.isAuthenticated = action.payload.isAuthenticated
        state.email = action.payload.data.email
        state.role = action.payload.data.role
        state.isInitialized = true
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.isAuthenticated = false
        state.email = state.role = null
        state.isInitialized = true
      })
  },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
