"use client";

import { useState, useEffect } from "react";

import WithSavingToDatabase from "@/components/editor/editor";

import { usePagesStore } from "@/stores/pages/pagesStore";
import SideBar from "@/components/notes/side-bar";

import { useParams } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/configs/firebase";
import { Separator } from "@/components/ui/separator";
import { fetchUserPages } from "@/services/pageService/pageService";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function NotePage({ user }: { user: any }) {
  const pagesState = usePagesStore();

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

  const fetchUsersPages = async () => {
    pagesState.setIsLoading(true);
    try {
      const data = await fetchUserPages(user?.uid as string);
      pagesState.updateBlocks(data.blocks || []);
      pagesState.updatePages(data.pages || []);
      pagesState.setCurrentPage(
        data.pages.find((page) => page.id === id) || null,
      );
      pagesState.setCurrentBlocks(
        data.blocks.find((block) => block.pageId === id) || null,
      );
    } catch (error) {
      console.error("Error fetching user pages:", error);
    } finally {
      pagesState.setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersPages();
  }, [user]);

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

  return (
    <div className="flex h-screen bg-white">
      {/* Main Content */}
      <div className="flex-1 py-16 px-8 overflow-auto">
        {pagesState.isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <input
            type="text"
            className="text-4xl font-bold ml-8 w-full bg-transparent border-none focus:outline-none"
            value={pagesState.currentPage?.title || ""}
            onChange={handlePageTitleChange}
            onBlur={savePageTitle}
            placeholder="Title for the page"
          />
        )}
        <Separator className="my-8" />
        {pagesState.currentBlocks && <WithSavingToDatabase />}
      </div>
    </div>
  );
}
