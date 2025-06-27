import { baseApi } from "../../../utils/apiBaseQuery";

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createfeedback: builder.mutation({
      query: (data) => ({
        url: "/feedbacks/create-feedback",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["feedback"],
    }),
  }),
});

// Export hooks
export const {
  useCreatefeedbackMutation
} = postApi;
