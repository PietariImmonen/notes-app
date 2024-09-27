"use client";

import { useState, useEffect } from "react";
import { PlusCircle, File, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WithSavingToDatabase from "@/components/editor/editor";
import { fetchUserPages } from "@/services/pageService/pageService";
import { usePagesStore } from "@/stores/pages/pagesStore";
import SideBar from "@/components/notes/side-bar";
import { Page } from "@/lib/types/types";

export default function NotePage({ user }: { user: any }) {
  const pagesState = usePagesStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");

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
    const pages = await fetchUserPages(user?.uid as string);
    pagesState.updateBlocks(pages.blocks || []);
    pagesState.updatePages(pages.pages || []);
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
        pages={pagesState.pages}
      />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <WithSavingToDatabase blocks={pagesState.blocks} />
      </div>
    </div>
  );
}
