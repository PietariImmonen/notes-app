export type APIResponse<T = object> =
  | { success: true; data: T }
  | { success: false; error: string };


export interface User {
  uid: string;
  email: string;
  createdAt: Date;
}
