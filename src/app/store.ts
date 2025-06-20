import { configureStore } from "@reduxjs/toolkit";
import { bookApi } from "../features/api/BookApi";

export const store = configureStore({
  reducer: {
    [bookApi.reducerPath]: bookApi.reducer,
  },

  //middlewares
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(bookApi.middleware),
});
