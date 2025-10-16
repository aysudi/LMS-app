import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaBan,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaUnlock,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  useAdminUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
  useBanUser,
  useUnbanUser,
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
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();

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
    const result = await Swal.fire({
      title: "Change User Role",
      text: `Are you sure you want to change this user's role to ${newRole}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const action = newStatus === "active" ? "activate" : "suspend";

    const result = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      text: `Are you sure you want to ${action} this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus === "active" ? "#10b981" : "#f59e0b",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${action}!`,
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await updateStatusMutation.mutateAsync({
        userId,
        status: newStatus as "active" | "suspended" | "pending",
      });
    }
  };

  const handleBanUser = async (
    userId: string,
    userName: string,
    currentlyBanned: boolean = false
  ) => {
    if (currentlyBanned) {
      // Unban user
      const result = await Swal.fire({
        title: "Unban User",
        text: `Are you sure you want to unban ${userName}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, unban!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        await unbanUserMutation.mutateAsync(userId);
      }
      return;
    }

    // Ban user with duration selection
    const { value: formValues } = await Swal.fire({
      title: `Ban ${userName}`,
      html: `
        <div class="text-left">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Ban Duration</label>
            <select id="banDuration" class="w-full p-2 border border-gray-300 rounded-md">
              <option value="1">1 Hour</option>
              <option value="6">6 Hours</option>
              <option value="12">12 Hours</option>
              <option value="24">1 Day</option>
              <option value="72">3 Days</option>
              <option value="168">1 Week</option>
              <option value="720">1 Month</option>
              <option value="0">Permanent</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <textarea id="banReason" class="w-full p-2 border border-gray-300 rounded-md" rows="3" placeholder="Enter reason for ban..."></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ban User",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const banDuration = (
          document.getElementById("banDuration") as HTMLSelectElement
        ).value;
        const banReason = (
          document.getElementById("banReason") as HTMLTextAreaElement
        ).value;

        if (!banReason.trim()) {
          Swal.showValidationMessage("Please provide a reason for the ban");
          return false;
        }

        return {
          banDuration: parseInt(banDuration),
          banReason: banReason.trim(),
        };
      },
    });

    if (formValues) {
      await banUserMutation.mutateAsync({
        userId,
        banDuration: formValues.banDuration,
        reason: formValues.banReason,
      });
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
                  {/* <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th> */}
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
                    {/* <td className="px-6 py-4">
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
                    </td> */}
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

                        {/* Ban/Unban Button */}
                        <button
                          onClick={() =>
                            handleBanUser(
                              user.id,
                              `${user.firstName} ${user.lastName}`,
                              user.isBanned
                            )
                          }
                          className={`transition-colors duration-200 p-2 rounded-lg ${
                            user.isBanned
                              ? "text-green-600 hover:text-green-800 hover:bg-green-50"
                              : "text-red-600 hover:text-red-800 hover:bg-red-50"
                          }`}
                          title={user.isBanned ? "Unban user" : "Ban user"}
                        >
                          {user.isBanned ? <FaUnlock /> : <FaBan />}
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
