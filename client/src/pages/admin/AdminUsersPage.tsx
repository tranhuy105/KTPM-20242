import { Loader2, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import { UserFilters } from "../../components/admin/users/UserFilters";
import { UsersTable } from "../../components/admin/users/UsersTable";
import { Button } from "../../components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import type {
    User,
    UserFilters as UserFiltersType,
} from "../../types";

const AdminUsersPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<UserFiltersType>(
        {
            page: 1,
            limit: 10,
            sortBy: "createdAt",
            sortOrder: "desc",
        }
    );
    const [pagination, setPagination] = useState({
        totalCount: 0,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
    });

    // Fetch users with current filters
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                if (
                    filters.role &&
                    filters.role === "all"
                ) {
                    delete filters.role;
                }
                const response = await userApi.getAllUsers(
                    filters
                );
                console.log(response);
                setUsers(response.users);
                setPagination({
                    totalCount:
                        response.pagination.totalCount,
                    currentPage:
                        response.pagination.currentPage,
                    totalPages:
                        response.pagination.totalPages,
                    hasNextPage:
                        response.pagination.hasNextPage,
                    hasPrevPage:
                        response.pagination.hasPrevPage,
                });
            } catch (error) {
                console.error(
                    "Error fetching users:",
                    error
                );
                toast.error("Failed to load users");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [filters]);

    // Handle filter changes
    const handleFilterChange = (
        newFilters: UserFiltersType
    ) => {
        setFilters({ ...filters, ...newFilters, page: 1 });
    };

    // Handle user deletion
    const handleDeleteUser = async (userId: string) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this user?"
            )
        )
            return;

        try {
            await userApi.deleteUser(userId);
            setUsers(
                users.filter((user) => user._id !== userId)
            );
            toast.success("User deleted successfully");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        }
    };

    // Handle user status toggle
    const handleToggleUserStatus = async (
        userId: string,
        isActive: boolean
    ) => {
        try {
            const updatedUser = await userApi.updateUser(
                userId,
                { isActive }
            );
            setUsers(
                users.map((user) =>
                    user._id === userId
                        ? {
                              ...user,
                              isActive:
                                  updatedUser.isActive,
                          }
                        : user
                )
            );
            toast.success(
                `User ${
                    isActive ? "activated" : "deactivated"
                } successfully`
            );
        } catch (error) {
            console.error(
                "Error updating user status:",
                error
            );
            toast.error("Failed to update user status");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">
                    Users Management
                </h1>
                <Button
                    onClick={() =>
                        navigate("/admin/users/new")
                    }
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                        Manage your users, their roles, and
                        permissions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <UserFilters
                            filters={filters}
                            onFilterChange={
                                handleFilterChange
                            }
                        />

                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : users && users.length > 0 ? (
                            <UsersTable
                                users={users}
                                onDeleteUser={
                                    handleDeleteUser
                                }
                                onToggleUserStatus={
                                    handleToggleUserStatus
                                }
                            />
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No users found. Try
                                adjusting your filters.
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {users.length} of{" "}
                                {pagination.totalCount}{" "}
                                users
                            </p>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        !pagination.hasPrevPage
                                    }
                                    onClick={() =>
                                        setFilters({
                                            ...filters,
                                            page:
                                                filters.page! -
                                                1,
                                        })
                                    }
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        !pagination.hasNextPage
                                    }
                                    onClick={() =>
                                        setFilters({
                                            ...filters,
                                            page:
                                                filters.page! +
                                                1,
                                        })
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminUsersPage;
