import { baseApi } from "../../../utils/apiBaseQuery";

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all categories
    categories: builder.query({
      query: ({ searchTerm = "" } = {}) => ({
        url: `/categories?searchTerm=${searchTerm}`,
        method: "GET",
      }),
      providesTags: ["category"],
    }),
    
    // Get subcategories by category ID
    subCategories: builder.query({
      query: (categoryId) => ({
        url: `/subcategories/subcategories-by-category/${categoryId}`,
        method: "GET",
      }),
      providesTags: ["subcategory"],
    }),
  }),
});

// Export hooks
export const {
  useCategoriesQuery,
  useSubCategoriesQuery
} = categoriesApi;