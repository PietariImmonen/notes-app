import NotePage from "@/sections/note-page/note-page";
import { getCurrentUser } from "@/lib/firebase/firebase-admin";
import { User } from "@/lib/types/types";
import NormalLayout from "@/layouts/normal-layout";
import { redirect } from "next/navigation";

const page = async () => {
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
      <NotePage
        user={
          {
            uid: user.uid,
            email: user.email,
          } as any
        }
      />
    </NormalLayout>
  );
};
export default page;
