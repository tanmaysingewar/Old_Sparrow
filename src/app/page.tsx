// "use server";
// import { redirect } from "next/navigation";

// export default async function LandingPage() {
//   return redirect("/chat?new=true");
// }

"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
} from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const { signIn, signOut } = useAuthActions();
  const isAuthenticated = useQuery(api.auth.isAuthenticated);
  const currentUser = useQuery(api.auth.getCurrentUser);

  console.log("isAuthenticated:", isAuthenticated);
  console.log("currentUser:", currentUser);

  // Type guard to check if currentUser is a user document
  const isUserDocument = (
    user: any
  ): user is {
    _id: string;
    _creationTime: number;
    name?: string;
    email?: string;
    phone?: string;
    image?: string;
    emailVerificationTime?: number;
    phoneVerificationTime?: number;
    isAnonymous?: boolean;
  } => {
    return (
      user &&
      typeof user._id === "string" &&
      typeof user._creationTime === "number" &&
      !user.userId
    );
  };

  return (
    <main className="p-24 text-white">
      <AuthLoading>
        <p>Loading...</p>
      </AuthLoading>

      <Authenticated>
        <div>
          <p>✅ You are authenticated!</p>
          {currentUser && isUserDocument(currentUser) && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">User Details:</h3>
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {currentUser.name || "Not provided"}
                </p>
                <p>
                  <strong>Email:</strong> {currentUser.email || "Not provided"}
                </p>
                <p>
                  <strong>Phone:</strong> {currentUser.phone || "Not provided"}
                </p>
                <p>
                  <strong>Email Verified:</strong>{" "}
                  {currentUser.emailVerificationTime ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Phone Verified:</strong>{" "}
                  {currentUser.phoneVerificationTime ? "Yes" : "No"}
                </p>
                {currentUser.image && (
                  <div>
                    <p>
                      <strong>Profile Image:</strong>
                    </p>
                    <img
                      src={currentUser.image}
                      alt="Profile"
                      // className="w-16 h-16 rounded-full mt-2"
                    />
                  </div>
                )}
                <p>
                  <strong>Is Anonymous:</strong>{" "}
                  {currentUser.isAnonymous ? "Yes" : "No"}
                </p>
                <p>
                  <strong>User ID:</strong> {currentUser._id}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(currentUser._creationTime).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => void signOut()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </Authenticated>

      <Unauthenticated>
        <div>
          <p>❌ You are not authenticated</p>
          <button
            onClick={() => void signIn("google")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign in with Google
          </button>
        </div>
      </Unauthenticated>
    </main>
  );
}
