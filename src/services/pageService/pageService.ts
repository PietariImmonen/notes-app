import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from "firebase/firestore";

import { Block, Page, PageWithBlocks } from "@/lib/types/types"; // Importing the Page interface
import { db } from "@/configs/firebase";
import { YooptaBlockData } from "@yoopta/editor";

export async function fetchUserPages(
  userId: string,
): Promise<{ pages: Page[]; blocks: PageWithBlocks[] }> {
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
    let blocks: { pageId: string; blocks: any }[] = [];
    for (const page of pages) {
      const blocksRef = collection(db, "Pages", page.id, "blocks");
      const blocksSnapshot = await getDocs(blocksRef);
      let pageBlocks = { pageId: page.id, blocks: {} } as {
        pageId: string;
        blocks: { [key: string]: YooptaBlockData };
      };
      blocksSnapshot.forEach((blockDoc) => {
        const blockData = blockDoc.data() as YooptaBlockData;
        pageBlocks.blocks[blockDoc.id] = {
          ...blockData,
        };
      });
      blocks.push(pageBlocks);
    }
    console.log({ pages: pages, blocks: blocks });
    return { pages: pages, blocks: blocks };
  } catch (error) {
    console.error("Error fetching user pages:", error);
    throw error;
  }
}

export async function savePageBlocks(
  pageId: string,
  blocks: { [key: string]: YooptaBlockData },
) {
  try {
    const pageRef = doc(db, "Pages", pageId);
    const pageDoc = await getDoc(pageRef);
    if (!pageDoc.exists()) {
      throw new Error("Page not found");
    }

    const blocksRef = collection(db, "Pages", pageId, "blocks");
    const existingBlocksSnapshot = await getDocs(blocksRef);
    const existingBlocks = new Map(
      existingBlocksSnapshot.docs.map((doc) => [
        doc.id,
        doc.data() as YooptaBlockData,
      ]),
    );
    const batch = writeBatch(db);

    for (const [blockId, block] of Object.entries(blocks)) {
      const blockRef = doc(blocksRef, blockId);
      console.log("blockId", blockId);
      if (!existingBlocks.has(blockId)) {
        console.log(block);
        // New block, create it
        batch.set(blockRef, block);
      } else {
        const existingBlock = existingBlocks.get(blockId);
        if (JSON.stringify(existingBlock) !== JSON.stringify(block)) {
          // Block has changed, update it
          batch.update(blockRef, block);
        }
      }

      // Remove the block from existingBlocks as we've processed it
      existingBlocks.delete(blockId);
    }
    // Delete any blocks that are in existingBlocks but not in the new blocks
    existingBlocks.forEach((_, blockId) => {
      const blockRef = doc(blocksRef, blockId);
      batch.delete(blockRef);
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error saving page blocks:", error);
    throw error;
  }
}
