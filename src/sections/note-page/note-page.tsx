"use client";

import { useState, useEffect } from "react";
import { PlusCircle, File, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WithSavingToDatabase from "@/components/editor/editor";
import { fetchUserPages } from "@/services/pageService/pageService";
import { usePagesStore } from "@/stores/pages/pagesStore";
import SideBar from "@/components/notes/side-bar";
import { Page, PageWithBlocks } from "@/lib/types/types";
import { useParams } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/configs/firebase";
import { Separator } from "@/components/ui/separator";

export default function NotePage({ user }: { user: any }) {
  const pagesState = usePagesStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");
  const { id } = useParams();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "/") {
        setSelectedTab((prev) => (prev === "write" ? "preview" : "write"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /**
   * Fetch the user's pages and set the current page and blocks
   */
  const fetchUsersPages = async () => {
    const data = await fetchUserPages(user?.uid as string);
    pagesState.updateBlocks(data.blocks || []);
    pagesState.updatePages(data.pages || []);
    pagesState.setCurrentPage(
      data.pages?.find((page: Page) => page.id === id) || null,
    );
    pagesState.setCurrentBlocks(
      data.blocks.find((block: PageWithBlocks) => block.pageId === id) || null,
    );
  };

  const handlePageTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    pagesState.setCurrentPage({
      ...pagesState.currentPage!,
      title: newTitle,
    });
    // Update the title in the pages array as well
    pagesState.updatePages(
      pagesState.pages.map((page) =>
        page.id === pagesState.currentPage?.id
          ? { ...page, title: newTitle }
          : page,
      ),
    );
  };

  const savePageTitle = async () => {
    if (pagesState.currentPage) {
      try {
        const pageRef = doc(db, "Pages", pagesState.currentPage.id);
        await setDoc(
          pageRef,
          { title: pagesState.currentPage.title },
          { merge: true },
        );
      } catch (error) {
        console.error("Error updating page title:", error);
      }
    }
  };

  useEffect(() => {
    void fetchUsersPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <SideBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        user={user}
      />

      {/* Main Content */}
      <div className="flex-1 py-16 px-8 overflow-auto">
        <input
          type="text"
          className="text-4xl font-bold ml-8 w-full bg-transparent border-none focus:outline-none"
          value={pagesState.currentPage?.title || ""}
          onChange={handlePageTitleChange}
          onBlur={savePageTitle}
        />
        <Separator className="my-8" />
        {pagesState.currentBlocks && (
          <WithSavingToDatabase blocks={pagesState.currentBlocks} />
        )}
      </div>
    </div>
  );
}
