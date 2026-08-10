import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

const baseQuery = fetchBaseQuery({
  baseUrl:"http://127.0.0.1:8000/api/v1/",
  

  prepareHeaders: (headers) => {
    const token =
      localStorage.getItem("access_token");

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(
    args,
    api,
    extraOptions
  );

  if (result.error?.status === 401) {
    const refreshToken =
      localStorage.getItem(
        "refresh_token"
      );

    if (refreshToken) {
      const refreshResult =
        await baseQuery(
          {
            url: "auth/refresh",
            method: "POST",
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
          api,
          extraOptions
        );

      if (refreshResult.data) {
        const data =
          refreshResult.data as {
            access_token: string;
          };

        localStorage.setItem(
          "access_token",
          data.access_token
        );

        result = await baseQuery(
          args,
          api,
          extraOptions
        );
      } else {
        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "refresh_token"
        );

        localStorage.removeItem(
          "user"
        );

        window.location.href =
          "/login";
      }
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithReauth,

  tagTypes: ["Bookings","Users"],

  endpoints: (builder) => ({
    // GET BOOKINGS
    getBookings: builder.query({
      query: (params) => ({
        url: "bookings/",
        params,
      }),
      providesTags: ["Bookings"],
    }),

    // GET ROOMS
    getRooms: builder.query({
      query: () => "rooms/",
    }),

    // REGISTER
    register: builder.mutation({
      query: (data) => ({
        url: "auth/register",
        method: "POST",
        body: data,
      }),
    }),

    // LOGIN
    login: builder.mutation({
      query: (data) => ({
        url: "auth/login",
        method: "POST",
        body: data,
      }),
    }),

    // GET CURRENT USER
    getMe: builder.query({
      query: () => ({
        url: "auth/me",
      }),
    }),

    updateMyProfile: builder.mutation({
  query: (data) => ({
    url: "auth/me",
    method: "PUT",
    body: data,
  }),
}),

deleteMyAccount: builder.mutation<void, void>({
  query: () => ({
    url: "auth/me",
    method: "DELETE",
  }),
}),

    
// RESET PASSWORD
resetPassword: builder.mutation({
  query: ({
    userId,
    new_password,
  }) => ({
    url: `users/${userId}/reset-password`,
    method: "POST",
    body: {
      new_password,
    },
  }),
}),



        // GET USERS
    getUsers: builder.query({
  query: () => ({
    url: "users/",
  }),
  providesTags: ["Users"],
}),

    // DELETE USER
    deleteUser: builder.mutation({
  query: (userId) => ({
    url: `users/${userId}`,
    method: "DELETE",
  }),
  invalidatesTags: ["Users"],
}),
   
   updateUser: builder.mutation({
  query: ({ userId, data }) => ({
    url: `users/${userId}`,
    method: "PUT",
    body: data,
  }),
  invalidatesTags: ["Users"],
}),
  
  updateUserRole: builder.mutation({
  query: ({ userId, role }) => ({
    url: `users/${userId}/role`,
    method: "PUT",
    body: { role },
  }),
  invalidatesTags: ["Users"],
}),



    // AVAILABILITY
    getAvailability: builder.query({
      query: ({
        start_time,
        end_time,
        required_capacity,
      }) => ({
        url: "rooms/availability",
        params: {
          start_time,
          end_time,
          required_capacity,
        },
      }),
    }),

    // CREATE BOOKING
    createBooking: builder.mutation({
      query: (data) => ({
        url: "bookings/",
        method: "POST",
        body: data,
      }),

      async onQueryStarted(
        _,
        { dispatch, queryFulfilled }
      ) {
        await queryFulfilled;
        dispatch(
          api.util.invalidateTags([
            "Bookings",
          ])
        );
      },
    }),

    // UPDATE BOOKING
    updateBooking: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `bookings/${id}/`,
        method: "PATCH",
        body: data,
      }),

      invalidatesTags: ["Bookings"],
    }),

    // DELETE BOOKING
    deleteBooking: builder.mutation({
      query: (id) => ({
        url: `bookings/${id}/`,
        method: "DELETE",
      }),

      invalidatesTags: ["Bookings"],
    }),
  }),
});


  


export const {
  useGetBookingsQuery,
  useGetRoomsQuery,
  useGetAvailabilityQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useGetUsersQuery,
  useDeleteUserMutation,
  useResetPasswordMutation,
  useUpdateUserMutation,
  useUpdateMyProfileMutation,
  useDeleteMyAccountMutation,
  useUpdateUserRoleMutation,
} = api;