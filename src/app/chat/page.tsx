"use client";
import { useEffect, useState } from "react";
import ChatInterface from "@/screens/Chat";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [auth, setAuth] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const auth = localStorage.getItem(
      "__convexAuthJWT_httpssuccessfultrout122convexcloud"
    );
    if (!auth) {
      router.push("/");
    }
    setAuth(auth || null);
  }, []);

  if (auth === null) {
    return;
  }

  return <ChatInterface />;
}
