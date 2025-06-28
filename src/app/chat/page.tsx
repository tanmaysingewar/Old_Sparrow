"use client";
import { useEffect, useState } from "react";
import ChatInterface from "@/screens/Chat";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [auth, setAuth] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const auth = localStorage.getItem("user-session-storage");
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
