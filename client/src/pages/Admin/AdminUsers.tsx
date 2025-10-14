import React, { useState } from "react";
import {
  FaSearch,
  FaUserShield,
  FaGraduationCap,
  FaUser,
  FaBan,
  FaCheck,
  FaEdit,
  FaEye,
} from "react-icons/fa";
import {
  useAdminUsers,
  useUpdateUserStatus,
  useUpdateUserRole,
  useBulkUpdateUsers,
} from "../../hooks/useAdmin";
// AdminUser type is handled by the API response

const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // API hooks
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useAdminUsers({
    page: currentPage,
    limit: 10,
    role: filterRole !== "all" ? filterRole : undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
    search: searchTerm || undefined,
  });

  const updateUserStatusMutation = useUpdateUserStatus();
  const updateUserRoleMutation = useUpdateUserRole();
  const bulkUpdateMutation = useBulkUpdateUsers();

  // Extract users from API response
  const users = usersResponse?.data?.users || [];
  const pagination = usersResponse?.data?.pagination;

  // Server-side filtering is now handled by the API

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handlePromoteToInstructor = (userId: string) => {
    updateUserRoleMutation.mutate({
      userId,
      role: "instructor",
    });
  };

  const handleSuspendUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      updateUserStatusMutation.mutate({
        userId,
        status: user.status === "suspended" ? "active" : "suspended",
      });
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) return;

    if (action === "promote") {
      bulkUpdateMutation.mutate({
        userIds: selectedUsers,
        updates: { role: "instructor" },
      });
    } else if (action === "suspend") {
      bulkUpdateMutation.mutate({
        userIds: selectedUsers,
        updates: { status: "suspended" },
      });
    } else if (action === "activate") {
      bulkUpdateMutation.mutate({
        userIds: selectedUsers,
        updates: { status: "active" },
      });
    }

    setSelectedUsers([]);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <FaUserShield className="text-purple-600" />;
      case "instructor":
        return <FaGraduationCap className="text-blue-600" />;
      case "student":
        return <FaUser className="text-green-600" />;
      default:
        return <FaUser className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Suspended
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: pagination?.totalUsers || 0,
    active: users.filter((u) => u.status === "active").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    pending: users.filter((u) => u.status === "pending").length,
    students: users.filter((u) => u.role === "student").length,
    instructors: users.filter((u) => u.role === "instructor").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filter changes
  const handleRoleFilterChange = (role: string) => {
    setFilterRole(role);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Users
          </h2>
          <p className="text-gray-600 mb-4">
            There was a problem loading the user data.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              User Management
            </h1>
            <p className="text-slate-600">
              Manage users, roles, and permissions across your platform
            </p>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
            Add New User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200/50">
            <div className="text-2xl font-bold text-blue-700">
              {stats.total}
            </div>
            <div className="text-blue-600 text-sm font-medium">Total Users</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200/50">
            <div className="text-2xl font-bold text-green-700">
              {stats.active}
            </div>
            <div className="text-green-600 text-sm font-medium">Active</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200/50">
            <div className="text-2xl font-bold text-red-700">
              {stats.suspended}
            </div>
            <div className="text-red-600 text-sm font-medium">Suspended</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200/50">
            <div className="text-2xl font-bold text-yellow-700">
              {stats.pending}
            </div>
            <div className="text-yellow-600 text-sm font-medium">Pending</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200/50">
            <div className="text-2xl font-bold text-emerald-700">
              {stats.students}
            </div>
            <div className="text-emerald-600 text-sm font-medium">Students</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200/50">
            <div className="text-2xl font-bold text-indigo-700">
              {stats.instructors}
            </div>
            <div className="text-indigo-600 text-sm font-medium">
              Instructors
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200/50">
            <div className="text-2xl font-bold text-purple-700">
              {stats.admins}
            </div>
            <div className="text-purple-600 text-sm font-medium">Admins</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => handleRoleFilterChange(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            disabled={isLoading}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            disabled={isLoading}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction("promote")}
                  disabled={bulkUpdateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                >
                  Promote to Instructor
                </button>
                <button
                  onClick={() => handleBulkAction("suspend")}
                  disabled={bulkUpdateMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                >
                  Suspend Users
                </button>
                <button
                  onClick={() => handleBulkAction("activate")}
                  disabled={bulkUpdateMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                >
                  Activate Users
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === users.length && users.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Activity
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Join Date
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-200 animate-pulse"
                  >
                    <td className="px-6 py-4">
                      <div className="w-4 h-4 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="w-32 h-4 bg-slate-200 rounded"></div>
                          <div className="w-24 h-3 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 h-4 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24 h-4 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20 h-4 bg-slate-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 bg-slate-200 rounded"></div>
                        <div className="w-8 h-8 bg-slate-200 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FaUser className="w-12 h-12 text-slate-300 mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        No users found
                      </h3>
                      <p className="text-slate-500">
                        Try adjusting your search or filter criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-slate-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <span className="text-sm font-medium text-slate-700 capitalize">
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        {user.lastActive}
                      </div>
                      <div className="text-xs text-slate-500">
                        {user.coursesEnrolled
                          ? `${user.coursesEnrolled} courses enrolled`
                          : user.coursesCreated
                          ? `${user.coursesCreated} courses created`
                          : "No activity"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <FaEye />
                        </button>
                        <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                          <FaEdit />
                        </button>
                        {user.role === "student" && (
                          <button
                            onClick={() => handlePromoteToInstructor(user.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Promote to Instructor"
                          >
                            <FaGraduationCap />
                          </button>
                        )}
                        <button
                          onClick={() => handleSuspendUser(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === "suspended"
                              ? "text-green-600 hover:bg-green-50"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                          title={
                            user.status === "suspended"
                              ? "Activate User"
                              : "Suspend User"
                          }
                        >
                          {user.status === "suspended" ? (
                            <FaCheck />
                          ) : (
                            <FaBan />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing {users.length} of {pagination?.totalUsers || 0} users
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={!pagination?.hasPreviousPage || isLoading}
                className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg">
                {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination?.hasNextPage || isLoading}
                className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
