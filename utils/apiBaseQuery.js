import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "./BaseURL";



export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseURL}/api/v1`,
    prepareHeaders: (headers, { endpoint }) => {
      // console.log(endpoint);
      if (endpoint == 'resetPassword') {
        const token = localStorage.getItem('forgot-password-otp-token');
        if (token) {
          headers.set('Authorization', token);
        }
      } else {
        const token = localStorage.getItem('loginToken');
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: ["post", "category", 'about', 'savepost', 'faq', 'feedback', 'report', "comment", "chat", "profile", 'notification', 'Slider', "message"],
});
