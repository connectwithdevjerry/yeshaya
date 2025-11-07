// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import integrationReducer from './slices/integrationSlice';
import assistantsReducer from "./slices/assistantsSlice";
import numbersReducer from './slices/numberSlice'


export const store = configureStore({
  reducer: {
    auth: authReducer,
    integrations: integrationReducer,
    assistants: assistantsReducer,
    numbers: numbersReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['your/action/type'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
});

export default store;