/**
 * Example usage hooks for the user query system
 * These are practical examples you can use in your components
 */

import { useState, useCallback } from "react";
import {
  useUsers,
  useUser,
  useCurrentUser,
  useInvalidateUsers,
} from "./useUserQueries";

// Example 1: Simple user list with search and filtering
export const useUserList = () => {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<
    "student" | "instructor" | "admin" | undefined
  >();
  const [page, setPage] = useState(1);

  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useUsers({
    search: search.trim(),
    role,
    page,
    limit: 10,
  });

  const users = usersResponse?.data.users || [];
  const pagination = usersResponse?.data.pagination;

  const handleSearch = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
    setPage(1); // Reset to first page when searching
  }, []);

  const handleRoleFilter = useCallback((newRole: typeof role) => {
    setRole(newRole);
    setPage(1); // Reset to first page when filtering
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setRole(undefined);
    setPage(1);
  }, []);

  return {
    // Data
    users,
    pagination,

    // Loading states
    isLoading,
    error,

    // Current filters
    search,
    role,
    page,

    // Actions
    handleSearch,
    handleRoleFilter,
    handlePageChange,
    clearFilters,
    refresh: refetch,
  };
};

// Example 2: User profile management
export const useUserProfile = (userId?: string) => {
  const { data: currentUser } = useCurrentUser();
  const { invalidateCurrentUser, invalidateUser } = useInvalidateUsers();

  // If no userId provided, use current user
  const targetUserId = userId || currentUser?.id;

  const {
    data: userResponse,
    isLoading,
    error,
    refetch,
  } = useUser(targetUserId || "", {
    enabled: !!targetUserId,
  });

  const user = userResponse?.data.user;
  const isOwnProfile = !userId || userId === currentUser?.id;

  const refreshProfile = useCallback(() => {
    if (isOwnProfile) {
      invalidateCurrentUser();
    } else if (targetUserId) {
      invalidateUser(targetUserId);
    }
  }, [isOwnProfile, targetUserId, invalidateCurrentUser, invalidateUser]);

  return {
    user,
    isLoading,
    error,
    isOwnProfile,
    refresh: refreshProfile,
    refetch,
  };
};

// Example 3: Authentication aware user data
export const useAuthenticatedUser = () => {
  const { data: user, isLoading, error, refetch } = useCurrentUser();

  const isAuthenticated = !!user && !!localStorage.getItem("accessToken");
  const isEmailVerified = user?.isEmailVerified ?? false;

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isEmailVerified,
    needsEmailVerification: isAuthenticated && !isEmailVerified,
    refresh: refetch,
  };
};

// Example 4: User search with debouncing
export const useUserSearch = (initialQuery = "") => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Simple debounce implementation
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const updateQuery = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        setDebouncedQuery(newQuery);
      }, 300); // 300ms debounce

      setDebounceTimer(timer);
    },
    [debounceTimer]
  );

  const {
    data: usersResponse,
    isLoading,
    error,
  } = useUsers(
    {
      search: debouncedQuery.trim(),
      limit: 5, // Limit results for search
    },
    {
      enabled: debouncedQuery.trim().length > 2, // Only search with 3+ characters
    }
  );

  const results = usersResponse?.data.users || [];

  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  }, [debounceTimer]);

  return {
    query,
    results,
    isLoading: isLoading && debouncedQuery.trim().length > 2,
    error,
    hasResults: results.length > 0,
    updateQuery,
    clearSearch,
  };
};

// Example 5: Instructor/Admin user management
export const useUserManagement = () => {
  const { invalidateUsersList, invalidateUser } = useInvalidateUsers();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const selectUser = useCallback((userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const selectAllUsers = useCallback((userIds: string[]) => {
    setSelectedUsers(userIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const refreshUserData = useCallback(() => {
    invalidateUsersList();
    selectedUsers.forEach((userId) => invalidateUser(userId));
  }, [invalidateUsersList, invalidateUser, selectedUsers]);

  return {
    selectedUsers,
    selectUser,
    selectAllUsers,
    clearSelection,
    refreshUserData,
    hasSelection: selectedUsers.length > 0,
    selectionCount: selectedUsers.length,
  };
};

// Export utility type for better TypeScript integration
export type UserListHook = ReturnType<typeof useUserList>;
export type UserProfileHook = ReturnType<typeof useUserProfile>;
export type AuthenticatedUserHook = ReturnType<typeof useAuthenticatedUser>;
export type UserSearchHook = ReturnType<typeof useUserSearch>;
export type UserManagementHook = ReturnType<typeof useUserManagement>;
