import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/firebase/firebase-admin";
import NotesDashboard from "@/components/dashboard/notes-dashboard";
import { User } from "@/lib/types/types";
import NormalLayout from "@/layouts/normal-layout";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return (
    <NormalLayout
      user={
        {
          uid: user.uid,
          email: user.email,
        } as any
      }
    >
      <NotesDashboard
        user={
          {
            uid: user.uid,
            email: user.email,
          } as any
        }
      />
    </NormalLayout>
  );
}
