import { Bell } from "lucide-react";
import { Button } from "../../ui/button";

export function AdminHeader() {
  return (
    <header className="border-b border-border h-14 px-6 flex items-center justify-between bg-white">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-lg font-semibold hidden md:block">
          Admin Dashboard
        </h1>
        <div className="relative max-w-md flex-1 hidden md:flex"></div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
        </Button>
      </div>
    </header>
  );
}
