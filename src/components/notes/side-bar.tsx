import { Page, User } from "@/lib/types/types";
import { Button } from "../ui/button";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  PlusCircle,
} from "lucide-react";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePagesStore } from "@/stores/pages/pagesStore";
import { createNewPage } from "@/services/pageService/pageService";

import { signOut } from "@/lib/firebase/auth";
import LogOutDropdownMenu from "./log-out-dropdown-menu";
import EditPageDropdown from "../dashboard/edit-page-dropdown";
import { Skeleton } from "../ui/skeleton";

interface SideBarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  user: User;
}

const SideBar = ({ isSidebarOpen, setIsSidebarOpen, user }: SideBarProps) => {
  const [newPageTitle, setNewPageTitle] = useState("");
  const {
    pages,
    updatePages,
    updateBlocks,
    blocks,
    setCurrentBlocks,
    setCurrentPage,
    isLoading,
  } = usePagesStore();

  // Get the id from the URL
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const createPage = async () => {
    const newPage = await createNewPage(user.uid as string, newPageTitle);
    if (newPage) {
      updatePages([...pages, newPage]);
      updateBlocks([...blocks, { pageId: newPage.id, blocks: {} }]);
      setCurrentBlocks({ pageId: newPage.id, blocks: {} });
      router.push(`/notes/${newPage.id}`);
    }
  };

  const handleSignOut = async () => {
    updatePages([]);
    updateBlocks([]);
    try {
      const isOk = await signOut();

      if (isOk) router.push("/log-in");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={`${
        isSidebarOpen ? "w-64 bg-gray-100 h-full" : "w-auto bg-white h-auto"
      } transition-all duration-300 ease-in-out flex flex-col fixed top-0 left-0 z-50 md:relative`}
    >
      {isSidebarOpen ? (
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <LogOutDropdownMenu
              handleSignOut={handleSignOut}
              handleBackToDashboard={() => router.push("/dashboard")}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="self-end"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center flex-grow">
              <Input
                type="text"
                placeholder="Add new page"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                className="mr-2"
              />
              <Button onClick={createPage} size="icon">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <nav className="overflow-y-auto flex-grow">
            {pages.map((page) => (
              <div
                key={page.id}
                className={`w-full justify-between items-center mb-1 px-2 py-1 flex rounded-md cursor-pointer ${
                  id === page.id ? "bg-gray-200" : ""
                }`}
                onClick={() => {
                  router.push(`/notes/${page.id}`);
                  setCurrentBlocks({
                    pageId: page.id,
                    blocks:
                      blocks.find((block) => block.pageId === page.id)
                        ?.blocks || {},
                  });
                }}
              >
                {page.title}
                <EditPageDropdown page={page} />
              </div>
            ))}
          </nav>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className="m-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
export default SideBar;
