import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/firebase/firebase-admin";
import NotesDashboard from "@/components/dashboard/notes-dashboard";
import { User } from "@/lib/types/types";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return (
    <main className="container">
      <NotesDashboard user={user as unknown as User} />
    </main>
  );
}
