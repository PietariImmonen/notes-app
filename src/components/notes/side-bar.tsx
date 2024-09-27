import { Page } from "@/lib/types/types";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface SideBarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  pages: Page[];
}

const SideBar = ({ isSidebarOpen, setIsSidebarOpen, pages }: SideBarProps) => {
  const [newPageTitle, setNewPageTitle] = useState("");

  // Get the id from the URL
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

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
              {/* <Button onClick={addNewPage} size="icon">
                  <PlusCircle className="h-4 w-4" />
                </Button> */}
            </div>
            <nav>
              {pages.map((page) => (
                <Button
                  key={page.id}
                  variant="ghost"
                  className={`w-full justify-start mb-1 ${
                    id === page.id ? "bg-gray-200" : ""
                  }`}
                  onClick={() => router.push(`/notes/${page.id}`)}
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
