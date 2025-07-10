import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/_lib/axios/axios'

api.defaults.withCredentials = true      // always send cookies

/* ---------- async bootstrap ---------- */
export const bootstrapAuth = createAsyncThunk(
  'auth/bootstrap',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/token/verify/')
      return data.user
    } catch {
      return rejectWithValue(null)      
    }
  }
)

interface AuthState {
  isAuthenticated: boolean
  email: string | null
  role: string | null
  bootstrapped: boolean          // so UI can wait for the check
}

const initialState: AuthState = {
  isAuthenticated: false,
  email: null,
  role: null,
  bootstrapped: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /* called after /login */
    loginSuccess: (state, action) => {
      state.isAuthenticated = true
      state.email           = action.payload.email
      state.role            = action.payload.role
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.email = state.role = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.email = action.payload.email
        state.role  = action.payload.role
        state.bootstrapped = true
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.isAuthenticated = false
        state.email = state.role = null
        state.bootstrapped = true
      })
  },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
