import { collection, query, where, getDocs, doc } from "firebase/firestore";

import { Page } from "@/lib/types/types"; // Importing the Page interface
import { db } from "@/configs/firebase";

export async function fetchUserPages(
  userId: string,
): Promise<{ pages: Page[]; blocks: any[] }> {
  try {
    const userRef = doc(db, "Users", userId);
    const pagesRef = collection(db, "Pages");
    const q = query(pagesRef, where("ownerId", "==", userRef));
    const querySnapshot = await getDocs(q);

    const pages: Page[] = [];
    querySnapshot.forEach((doc) => {
      pages.push({ id: doc.id, ...doc.data() } as Page);
    });
    // Fetch blocks for each page
    let blocks: any[] = [];
    for (const page of pages) {
      const blocksRef = collection(db, "Pages", page.id, "blocks");
      const blocksSnapshot = await getDocs(blocksRef);

      blocksSnapshot.forEach((blockDoc) => {
        blocks.push({ id: blockDoc.id, ...blockDoc.data() });
      });
    }
    //Todo: Return Blocks with page id.
    return { pages: pages, blocks: blocks };
  } catch (error) {
    console.error("Error fetching user pages:", error);
    throw error;
  }
}
