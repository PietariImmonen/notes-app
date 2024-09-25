import NotePage from "@/sections/note-page/note-page"
import { getCurrentUser } from "@/lib/firebase/firebase-admin";

const page = async () => {
  const user = await getCurrentUser()
  return (
    <NotePage user={user}/>
  )
}
export default page