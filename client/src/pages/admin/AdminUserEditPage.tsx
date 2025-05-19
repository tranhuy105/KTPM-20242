import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import UserForm from "../../components/admin/users/UserForm";
import userApi from "../../api/userApi";
import toast from "react-hot-toast";
import type { User } from "../../types";

const AdminUserEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError("User ID is required");
        setIsLoading(false);
        return;
      }

      try {
        const userData = await userApi.getUserById(id);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load user";
        setError(errorMessage);
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => navigate("/admin/users")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <h1 className="text-3xl font-bold">Edit User</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          {error}
        </div>
      ) : user ? (
        <UserForm user={user} isEdit={true} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          User not found.
        </div>
      )}
    </div>
  );
};

export default AdminUserEditPage;
