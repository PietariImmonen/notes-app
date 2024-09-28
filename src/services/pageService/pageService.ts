import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
  addDoc,
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
    return { pages: pages, blocks: blocks };
  } catch (error) {
    console.error("Error fetching user pages:", error);
    throw error;
  }
}

/**
 * This function is used to save the blocks of a page to the server.
 * It uses a batch to update the blocks.
 * It deletes any blocks that are in the existing blocks but not in the new blocks.
 * It returns true if the blocks were saved successfully, false otherwise.
 * @param pageId - The id of the page to save the blocks to.
 * @param blocks - The blocks to save to the page.
 * @returns - True if the blocks were saved successfully, false otherwise.
 */
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
      if (!existingBlocks.has(blockId)) {
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

export async function createNewPage(
  userId: string,
  pageTitle: string,
): Promise<Page | undefined> {
  try {
    const pagesCollection = collection(db, "Pages");

    const userRef = doc(db, "Users", userId);

    const newPageData = {
      title: pageTitle,
      ownerId: userRef,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      public: false,
      sharedWith: [],
    };

    const newPageRef = await addDoc(pagesCollection, newPageData);

    // // Create an initial empty block for the new page
    // const blocksCollection = collection(db, "Pages", newPageRef.id, "blocks");
    // Fetch the newly created page
    const newPage = await getDoc(newPageRef);

    // Return the page data
    return { id: newPageRef.id, ...newPage.data() } as Page;
  } catch (error) {
    console.error("Error creating new page:", error);
    throw error;
    return undefined;
  }
}
