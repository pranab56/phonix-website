import { baseApi } from "../../../utils/apiBaseQuery";

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    savepost: builder.mutation({
      query: (data) => ({
        url: "/save-post/save-or-remove",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["savepost"],
    }),

    getSaveAllPost: builder.query({
      query: () => ({
        url: `/save-post`,
        method: "GET",
      }),
      providesTags: ["savepost"],
    }),

   
  }),
});

// Export hooks
export const {
useSavepostMutation,
useGetSaveAllPostQuery
} = postApi;
