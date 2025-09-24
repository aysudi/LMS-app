import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import {
  getUsers,
  getUserById,
  getUserByUsername,
  getCurrentUser,
} from "../services/user.service";
import type {
  User,
  GetUsersResponse,
  GetUserResponse,
  GetUsersParams,
} from "../types/user.type";

// Query keys for consistent cache management
export const userQueryKeys = {
  all: ["users"] as const,
  lists: () => [...userQueryKeys.all, "list"] as const,
  list: (params: GetUsersParams) => [...userQueryKeys.lists(), params] as const,
  details: () => [...userQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const,
  byUsername: (username: string) =>
    [...userQueryKeys.all, "username", username] as const,
  currentUser: () => [...userQueryKeys.all, "me"] as const,
};

// Get current user hook
export const useCurrentUser = (
  options?: Omit<UseQueryOptions<User, Error>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: userQueryKeys.currentUser(),
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
    throwOnError: false, // Prevent throwing errors to the component
    refetchOnWindowFocus: false, // Don't refetch on window focus
    ...options,
  });
};

// Get users with pagination hook
export const useUsers = (
  params: GetUsersParams = {},
  options?: Omit<
    UseQueryOptions<GetUsersResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: userQueryKeys.list(params),
    queryFn: () => getUsers(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    // Enable query only if we have valid parameters
    enabled: true,
    ...options,
  });
};

// Infinite query for users (for pagination with load more)
export const useInfiniteUsers = (
  baseParams: Omit<GetUsersParams, "page"> = {},
  options?: any
) => {
  return useInfiniteQuery({
    queryKey: [...userQueryKeys.lists(), "infinite", baseParams],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getUsers({ ...baseParams, page: pageParam }),
    getNextPageParam: (lastPage: GetUsersResponse) => {
      const { pagination } = lastPage.data;
      return pagination.hasNextPage ? pagination.currentPage + 1 : undefined;
    },
    getPreviousPageParam: (firstPage: GetUsersResponse) => {
      const { pagination } = firstPage.data;
      return pagination.hasPreviousPage
        ? pagination.currentPage - 1
        : undefined;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    initialPageParam: 1,
    ...options,
  });
};

// Get user by ID hook
export const useUser = (
  userId: string,
  options?: Omit<
    UseQueryOptions<GetUserResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: userQueryKeys.detail(userId),
    queryFn: () => getUserById(userId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!userId,
    ...options,
  });
};

// Get user by username hook
export const useUserByUsername = (
  username: string,
  options?: Omit<
    UseQueryOptions<GetUserResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: userQueryKeys.byUsername(username),
    queryFn: () => getUserByUsername(username),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!username,
    ...options,
  });
};

// Prefetch users hook for performance optimization
export const usePrefetchUsers = () => {
  const queryClient = useQueryClient();

  const prefetchUsers = (params: GetUsersParams = {}) => {
    queryClient.prefetchQuery({
      queryKey: userQueryKeys.list(params),
      queryFn: () => getUsers(params),
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchUser = (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: userQueryKeys.detail(userId),
      queryFn: () => getUserById(userId),
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetchUsers, prefetchUser };
};

// Helper hook for invalidating user queries
export const useInvalidateUsers = () => {
  const queryClient = useQueryClient();

  const invalidateAllUsers = () => {
    queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
  };

  const invalidateUsersList = () => {
    queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
  };

  const invalidateUser = (userId: string) => {
    queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(userId) });
  };

  const invalidateCurrentUser = () => {
    queryClient.invalidateQueries({ queryKey: userQueryKeys.currentUser() });
  };

  return {
    invalidateAllUsers,
    invalidateUsersList,
    invalidateUser,
    invalidateCurrentUser,
  };
};
