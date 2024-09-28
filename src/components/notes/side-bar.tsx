import { Page, User } from "@/lib/types/types";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePagesStore } from "@/stores/pages/pagesStore";
import { createNewPage } from "@/services/pageService/pageService";

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

  return (
    <div
      className={`bg-gray-100 ${
        isSidebarOpen ? "w-64" : "w-16"
      } transition-all duration-300 ease-in-out`}
    >
      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="mb-4"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        {isSidebarOpen && (
          <>
            <div className="flex items-center mb-4">
              <Input
                type="text"
                placeholder="New page title"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                className="mr-2"
              />
              <Button onClick={createPage} size="icon">
                <PlusCircle className="h-4 w-4" />
              </Button>
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
