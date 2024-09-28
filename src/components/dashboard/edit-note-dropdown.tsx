import { MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Page } from "@/lib/types/types";
import {
  deletePage,
  togglePagePublicStatus,
} from "@/services/pageService/pageService";
import { usePagesStore } from "@/stores/pages/pagesStore";

const EditPageDropdown = ({ page }: { page: Page }) => {
  const { pages, updatePages } = usePagesStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={async (e) => {
            e.stopPropagation();
            // Toggle public status
            await togglePagePublicStatus(page.id);
            const updatedPages = pages.map((p) =>
              p.id === page.id ? { ...p, public: !p.public } : p,
            );
            updatePages(updatedPages);
          }}
        >
          {page.public ? "Make Private" : "Make Public"}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-destructive"
          onClick={async (e) => {
            e.stopPropagation();
            await deletePage(page.id);
            const updatedPages = pages.filter((p) => p.id !== page.id);
            updatePages(updatedPages);
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default EditPageDropdown;
