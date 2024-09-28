import { MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";

const LogOutDropdownMenu = ({
  handleSignOut,
  handleBackToDashboard,
}: {
  handleSignOut: () => void;
  handleBackToDashboard: () => void;
}) => {
  const pathname = usePathname();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {pathname !== "/dashboard" && (
          <DropdownMenuItem onClick={handleBackToDashboard}>
            Back to dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default LogOutDropdownMenu;
