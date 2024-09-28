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
    const isOk = await signOut();

    if (isOk) router.push("/log-in");
  };

  return (
    <div
      className={` ${
        isSidebarOpen ? "w-64 bg-gray-100" : "w-16 bg-white"
      } transition-all duration-300 ease-in-out flex flex-col`}
    >
      <div className="p-4 flex flex-col h-full">
        {isSidebarOpen ? (
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
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="mb-4 self-center"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        {isSidebarOpen && (
          <>
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
            <nav>
              {pages.map((page) => (
                <Button
                  key={page.id}
                  variant="ghost"
                  className={`w-full justify-start mb-1 ${
                    id === page.id ? "bg-gray-200" : ""
                  }`}
                  onClick={() => {
                    setCurrentBlocks({
                      pageId: page.id,
                      blocks:
                        blocks.find((block) => block.pageId === page.id)
                          ?.blocks || {},
                    });
                    setCurrentPage(pages.find((p) => p.id === page.id) || null);
                    router.push(`/notes/${page.id}`);
                  }}
                >
                  {page.title}
                </Button>
              ))}
            </nav>
          </>
        )}
      </div>
    </div>
  );
};
export default SideBar;
