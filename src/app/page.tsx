"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    const userSessionStorage = localStorage.getItem("user-session-storage");
    if (userSessionStorage) {
      return redirect("/chat?new=true");
    } else {
      return redirect("/login");
    }
  }, []);

  return <div>LandingPage</div>;
}
