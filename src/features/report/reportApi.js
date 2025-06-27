import { baseApi } from "../../../utils/apiBaseQuery";

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    report: builder.mutation({
      query: (data) => ({
        url: "/reports/create-report",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["report"],
    }),
    silder: builder.query({
      query: (status = 'active') => ({
        url: `/announcement-slider?status=${status}`,
        method: "GET",
      }),
      providesTags: ["Slider"], // Changed from "faq" to more appropriate "Slider"
    }),

     logo: builder.query({
      query: () => ({
        url: `/website-logo`,
        method: "GET",
      }),
      providesTags: [], // Changed from "faq" to more appropriate "Slider"
    })
  }),
});

// Export hooks
export const {
  useReportMutation,
  useSilderQuery,
  useLogoQuery
} = postApi;
