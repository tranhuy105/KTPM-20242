import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import UserForm from "../../components/admin/users/UserForm";

const AdminUserCreatePage = () => {
  const navigate = useNavigate();

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
        <h1 className="text-3xl font-bold">Create New User</h1>
      </div>

      <UserForm isEdit={false} />
    </div>
  );
};

export default AdminUserCreatePage;
