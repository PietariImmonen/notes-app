import { YooptaBlockData } from "@yoopta/editor";
import { DocumentReference, Timestamp } from "firebase/firestore";

export type APIResponse<T = object> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface Permission {
  userId: DocumentReference;
  role: "owner" | "editor" | "viewer";
}

export interface User {
  uid: string;
  email: string;
  createdAt: Timestamp;
  pages: DocumentReference[];
}

export interface Page {
  id: string;
  ownerId: DocumentReference;
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  permissions: Permission[];
  public: boolean;
  sharedWith: DocumentReference[];
}

export type Block = { id: string; blocks: YooptaBlockData };

export type PageWithBlocks = {
  pageId: string;
  blocks: { [key: string]: YooptaBlockData };
};
