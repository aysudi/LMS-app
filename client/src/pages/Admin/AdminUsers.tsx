import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaTrash,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
} from "react-icons/fa";
import {
  useAdminUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
  useDeleteUser,
} from "../../hooks/useAdmin";
import type { AdminUser } from "../../types/admin.type";

const AdminUsers: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search input
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useAdminUsers({
    search: searchTerm,
    role: roleFilter !== "all" ? roleFilter : undefined,
    sortBy,
    sortOrder,
    page: 1,
    limit: 20,
  });

  const users = usersData?.data?.users || [];
  const totalUsers = usersData?.data?.pagination?.totalUsers || 0;
  const activeUsers = users.filter(
    (user: AdminUser) => user.status === "active"
  ).length;
  const suspendedUsers = users.filter(
    (user: AdminUser) => user.status === "suspended"
  ).length;

  // Initialize mutation hooks
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
  };

  const handleChangeRole = async (
    userId: string,
    newRole: "student" | "instructor" | "admin"
  ) => {
    if (
      window.confirm(
        `Are you sure you want to change this user's role to ${newRole}?`
      )
    ) {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const action = newStatus === "active" ? "activate" : "suspend";

    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      await updateStatusMutation.mutateAsync({
        userId,
        status: newStatus as "active" | "suspended" | "pending",
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete ${userName}? This action cannot be undone.`
      )
    ) {
      await deleteUserMutation.mutateAsync(userId);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading users</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">
          User Management
        </h1>
        <p className="text-slate-600">
          Manage your platform users and their permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-slate-800">{totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FaUsers className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <FaUserCheck className="text-white text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">
                Suspended Users
              </p>
              <p className="text-3xl font-bold text-red-600">
                {suspendedUsers}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <FaUserTimes className="text-white text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={isLoading}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
            </select>

            {/* Sort Filter */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order as "asc" | "desc");
              }}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={isLoading}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="firstName-asc">Name A-Z</option>
              <option value="firstName-desc">Name Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading users...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FaUsers className="text-slate-400 text-4xl mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No users found</p>
              <p className="text-slate-500">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.firstName?.charAt(0)}
                          {user.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-slate-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "instructor"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : user.status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Role Change Dropdown */}
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleChangeRole(
                              user.id,
                              e.target.value as
                                | "student"
                                | "instructor"
                                | "admin"
                            )
                          }
                          className="text-sm border border-slate-300 rounded-lg px-2 py-1 hover:bg-blue-50 transition-colors"
                          title="Change user role"
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>

                        {/* Status Toggle */}
                        <button
                          onClick={() =>
                            handleToggleStatus(user.id, user.status)
                          }
                          className={`transition-colors duration-200 p-2 rounded-lg ${
                            user.status === "active"
                              ? "text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                              : "text-green-600 hover:text-green-800 hover:bg-green-50"
                          }`}
                          title={
                            user.status === "active"
                              ? "Suspend user"
                              : "Activate user"
                          }
                        >
                          {user.status === "active" ? (
                            <FaUserTimes />
                          ) : (
                            <FaUserCheck />
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() =>
                            handleDeleteUser(
                              user.id,
                              `${user.firstName} ${user.lastName}`
                            )
                          }
                          className="text-red-600 hover:text-red-800 transition-colors duration-200 p-2 hover:bg-red-50 rounded-lg"
                          title="Delete user"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
