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
  updateDoc,
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
/**
 * This function is used to create a new page.
 * It creates a new page document in the Pages collection.
 * It creates an initial empty block for the new page.
 * It returns the new page data.
 * @param userId - The id of the user to create the page for.
 * @param pageTitle - The title of the new page.
 * @returns - The new page data.
 */
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
    const blocksCollection = collection(db, "Pages", newPageRef.id, "blocks");
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

/**
 * This function is used to delete a page and all its associated blocks.
 * It uses a batch to delete the page and all its blocks.
 * It returns true if the page and all its blocks were deleted successfully, false otherwise.
 * @param pageId - The id of the page to delete.
 * @returns - True if the page and all its blocks were deleted successfully, false otherwise.
 */
export async function deletePage(pageId: string): Promise<boolean> {
  try {
    const pageRef = doc(db, "Pages", pageId);
    const blocksCollectionRef = collection(db, "Pages", pageId, "blocks");

    const batch = writeBatch(db);

    // Delete the page document
    batch.delete(pageRef);

    // Delete all blocks associated with the page
    const blocksSnapshot = await getDocs(blocksCollectionRef);
    blocksSnapshot.forEach((blockDoc) => {
      batch.delete(doc(blocksCollectionRef, blockDoc.id));
    });

    // Commit the batch
    await batch.commit();

    console.log(
      `Page ${pageId} and its blocks have been deleted successfully.`,
    );
    return true;
  } catch (error) {
    console.error("Error deleting page:", error);
    return false;
  }
}

/**
 * This function toggles the public status of a page.
 * It changes the public field from true to false or vice versa.
 * @param pageId - The id of the page to update.
 * @returns - The updated Page object if successful, undefined otherwise.
 */
export async function togglePagePublicStatus(
  pageId: string,
): Promise<Page | undefined> {
  try {
    const pageRef = doc(db, "Pages", pageId);

    // Get the current page data
    const pageSnapshot = await getDoc(pageRef);
    if (!pageSnapshot.exists()) {
      console.error("Page not found");
      return undefined;
    }

    const currentPage = pageSnapshot.data() as Page;

    // Toggle the public status
    const updatedPublicStatus = !currentPage.public;

    // Update the page document
    await updateDoc(pageRef, { public: updatedPublicStatus });

    // Fetch the updated page
    const updatedPageSnapshot = await getDoc(pageRef);

    console.log(
      `Page ${pageId} public status has been updated to ${updatedPublicStatus}`,
    );

    // Return the updated page data
    return { id: pageId, ...updatedPageSnapshot.data() } as Page;
  } catch (error) {
    console.error("Error toggling page public status:", error);
    return undefined;
  }
}
