import { baseApi } from "../../../utils/apiBaseQuery";



export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getfaq: builder.query({
            query: () => ({
                url: `/faqs`,
                method: "GET",
            }),
            providesTags: ["faq"],
        }),
        getfaqCategory: builder.query({
            query: () => ({
                url: `/faq-categories`,
                method: "GET",
            }),
            providesTags: ["faq"],
        })
    }),
});

// Export hooks
export const {
    useGetfaqQuery,
    useGetfaqCategoryQuery
} = authApi;
