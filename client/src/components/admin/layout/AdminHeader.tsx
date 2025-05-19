import { Bell, Search } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

export function AdminHeader() {
  return (
    <header className="border-b border-border h-14 px-6 flex items-center justify-between bg-white">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-lg font-semibold hidden md:block">
          Admin Dashboard
        </h1>
        <div className="relative max-w-md flex-1 hidden md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 bg-background w-full"
          />
        </div>
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
