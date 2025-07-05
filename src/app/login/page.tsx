"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
} from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import { useUserStore } from "@/store/userStore";
import { Libre_Baskerville } from "next/font/google";
import { cn } from "@/lib/utils";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const { setUser } = useUserStore();
  const currentUser = useQuery(api.auth.getCurrentUser);

  useEffect(() => {
    if (currentUser) {
      setUser({
        id: currentUser._id,
        name: currentUser.name || "",
        email: currentUser.email || "",
        emailVerified: currentUser.emailVerificationTime ? true : false,
        createdAt: new Date(currentUser._creationTime),
        updatedAt: new Date(currentUser._creationTime),
        image: currentUser.image || "",
      });
    }
  }, [currentUser, setUser]);

  return (
    <div className="min-h-screen bg-[#f8f8f7] dark:bg-[#222325] flex items-center justify-center p-4">
      <AuthLoading>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-300"></div>
        </div>
      </AuthLoading>

      <Authenticated>
        <AuthenticatedRedirect />
      </Authenticated>

      <Unauthenticated>
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2
              className={cn(
                "text-2xl font-bold text-gray-900 dark:text-[#dadada] mb-2",
                libreBaskerville.className
              )}
            >
              Welcome to Old Sparrow
            </h2>
            <p className="text-sm text-[#7f7f7f] dark:text-gray-400">
              Sign in to start your health insurance journey
            </p>
          </div>

          <div className="bg-white dark:bg-[#272728] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1">
            <button
              onClick={() => void signIn("google", { redirectTo: "/login" })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-[#36383a] border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-[#404142] transition-colors duration-200 text-gray-700 dark:text-gray-200 font-medium cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* <div className="text-center">
            <p className="text-xs text-[#7f7f7f] dark:text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div> */}
        </div>
      </Unauthenticated>
    </div>
  );
}

// Component to handle authenticated redirect
function AuthenticatedRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to chat immediately when authenticated
    router.push("/chat?new=true");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-300"></div>
      <p className="text-gray-600 dark:text-gray-300 text-sm">Redirecting...</p>
    </div>
  );
}
