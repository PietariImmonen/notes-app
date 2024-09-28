"use client";

import SideBar from "@/components/notes/side-bar";
import { User } from "@/lib/types/types";
import { useState } from "react";

const NormalLayout = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <SideBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        user={user}
      />

      {/* Main Content */}
      <div className="flex-1 py-16 px-8 overflow-auto">{children}</div>
    </div>
  );
};
export default NormalLayout;
