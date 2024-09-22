import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import { APIResponse } from "@/lib/types/types";
import { auth, db } from "@/configs/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    const userCreds = await signInWithPopup(auth, provider);
    const idToken = await userCreds.user.getIdToken();
    const userRef = doc(db, "Users", userCreds.user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: userCreds.user.uid,
        email: userCreds.user.email,
        createdAt: new Date(),
      });
    }
    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });
    const resBody = (await response.json()) as unknown as APIResponse<string>;
    if (response.ok && resBody.success) {
      return true;
    } else return false;
  } catch (error) {
    console.error("Error signing in with Google", error);
    return false;
  }
}

export async function signInWithEmailAndPasswordAuth(
  email: string,
  password: string,
) {
  try {
    const userCreds = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCreds.user.getIdToken();

    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });
    const resBody = await response.json();
    if (response.ok && resBody.success) {
      return true;
    } else return false;
  } catch (error) {
    console.error("Error signing in with email and password", error);
    return false;
  }
}

export async function createUserWithEmailAndPasswordAuth(
  email: string,
  password: string,
) {
  try {
    const userCreds = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const idToken = await userCreds.user.getIdToken();
    const userRef = doc(db, "Users", userCreds.user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: userCreds.user.uid,
        email: userCreds.user.email,
        createdAt: new Date(),
      });
    }


    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });
    const resBody = await response.json();
    if (response.ok && resBody.success) {
      return true;
    } else return false;
  } catch (error) {
    console.error("Error on creating user with email and password: ", error);
    return false;
  }
}

export async function signOut() {
  try {
    await auth.signOut();

    const response = await fetch("/api/auth/sign-out", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const resBody = (await response.json()) as unknown as APIResponse<string>;
    if (response.ok && resBody.success) {
      return true;
    } else return false;
  } catch (error) {
    console.error("Error signing out with Google", error);
    return false;
  }
}
