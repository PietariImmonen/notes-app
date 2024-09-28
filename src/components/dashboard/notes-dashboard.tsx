"use client";

import { useState, useEffect } from "react";
import { Loader2, MoreVertical, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Page, PageWithBlocks, User } from "@/lib/types/types";
import {
  createNewPage,
  fetchUserPages,
} from "@/services/pageService/pageService";
import { usePagesStore } from "@/stores/pages/pagesStore";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import EditPageDropdown from "./edit-page-dropdown";
import { Skeleton } from "../ui/skeleton";

// Mock data for recent notes
export default function NotesDashboard({ user }: { user: User }) {
  const [searchQuery, setSearchQuery] = useState("");
  const pagesState = usePagesStore();
  const router = useRouter();
  const [newPageTitle, setNewPageTitle] = useState<string>("");

  /**
   * Fetch the user's pages and set the current page and blocks
   */
  const fetchUsersPages = async () => {
    pagesState.setIsLoading(true);
    try {
      const data = await fetchUserPages(user?.uid as string);
      pagesState.updateBlocks(data.blocks || []);
      pagesState.updatePages(data.pages || []);
    } catch (error) {
      console.error(error);
    } finally {
      pagesState.setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersPages();
  }, [user]);

  const navigateToNote = (id: string) => {
    pagesState.setCurrentPage(
      pagesState.pages.find((page) => page.id === id) || null,
    );
    pagesState.setCurrentBlocks(
      pagesState.blocks.find((block) => block.pageId === id) || null,
    ),
      router.push(`/notes/${id}`);
  };

  const createPage = async (title: string) => {
    const newPage = await createNewPage(user.uid as string, title);
    if (newPage) {
      pagesState.updatePages([...pagesState.pages, newPage]);
      pagesState.updateBlocks([
        ...pagesState.blocks,
        { pageId: newPage.id, blocks: {} },
      ]);
      pagesState.setCurrentPage(newPage);
      pagesState.setCurrentBlocks({ pageId: newPage.id, blocks: {} });
      setNewPageTitle("");
      router.push(`/notes/${newPage.id}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">All notes</h1>

      <div className="mb-6 flex justify-between items-center">
        <Input
          type="text"
          placeholder="New note title"
          value={newPageTitle}
          onChange={(e) => setNewPageTitle(e.target.value)}
          className="mr-2 flex-grow"
        />
        <Button onClick={() => createPage(newPageTitle)}>
          Create New Note
        </Button>
      </div>
      {pagesState.isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin w-12 h-12" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pagesState.pages.map((page) => (
            <Card
              key={page.id}
              className="cursor-pointer"
              onClick={() => navigateToNote(page.id)}
            >
              <CardHeader className="flex justify-between items-start">
                <div className="flex justify-between items-center w-full">
                  <CardTitle>{page.title}</CardTitle>
                  <EditPageDropdown page={page} />
                </div>

                <div className="flex justify-between w-full flex-col text-muted-foreground text-sm">
                  <p>{page.createdAt.toDate().toLocaleDateString()}</p>
                  <p>{page.public ? "Public" : "Private"}</p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
