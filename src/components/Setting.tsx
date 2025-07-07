// app/routes/settings.tsx
"use client";
import { useState, useEffect } from "react";
import {
  DollarSign,
  Loader2,
  LogOutIcon,
  Monitor,
  Moon,
  Sun,
  UserRound,
} from "lucide-react"; // Removed unused Database icon
import { Avatar, AvatarFallback } from "./ui/avatar";
// import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import Image from "next/image";
import { Switch } from "./ui/switch";
import { useUserStore } from "@/store/userStore";
import Default from "@/assets/default.png";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Input } from "./ui/input";
import { useCredits } from "@/store/creditStore";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

// 2. Use the SettingsProps interface and destructure 'user' from it
export default function Settings() {
  const router = useRouter();
  const [selected, setSelected] = useState("Account");
  const [coupon, setCoupon] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const { user, setUser } = useUserStore();
  const [logOutLading, setLogOutLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const { credits } = useCredits();
  const applyCouponMutation = useMutation(api.coupon.applyCoupon);
  const { signOut } = useAuthActions();

  useEffect(() => {
    // Placeholder logic: Set example values
    // TODO: Replace this with your actual logic to get these values
    // Maybe fetch from an API, read from Zustand store, or parse from local storage
    const storedRateLimit = localStorage.getItem("userRateLimit"); // Example: assuming this stores the *total* limit like "20"
    if (storedRateLimit) {
      const remainingLimit = parseInt(storedRateLimit, 10);
      if (!isNaN(remainingLimit)) {
      } else {
        console.error(
          "Could not parse totalLimit from localStorage:",
          storedRateLimit
        );
      }
    } else {
      // Set defaults if nothing in local storage
      console.warn(
        "userRateLimit not found in localStorage. Using default values."
      );
    }
  }, []);

  const handleLogout = async () => {
    try {
      setLogOutLoading(true);

      // Sign out from Convex Auth
      await signOut();

      // Clear user store
      setUser(undefined);

      // Clear localStorage
      localStorage.removeItem("user-session-storage");

      // Redirect to login page
      router.push("/login");

      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    } finally {
      setLogOutLoading(false);
    }
  };

  const addCoupon = async () => {
    setCouponLoading(true);
    setCouponError("");
    const result = await applyCouponMutation({ coupon: coupon });
    if (!result) {
      setCouponError("Invalid coupon");
    } else {
      toast.success("Coupon added");
      setCoupon("");
      setCouponError("");
    }
    setCouponLoading(false);
  };

  return (
    <div className=" flex flex-col">
      <div className="p-3 dark:bg-[#212122] rounded-3xl">
        <p className="text-xl font-normal ml-3 mt-3">Settings</p>
        <div className="flex flex-row">
          <div className="mt-5 min-w-44 gap-2 flex flex-col">
            <div
              className={`flex gap-2 text-sm text-left font-light cursor-pointer rounded-xl px-4 py-3 dark:text-neutral-400 ${
                selected === "Account"
                  ? "bg-[#eeeeed] dark:bg-[#28292b] dark:text-white"
                  : "hover:bg-neutral-700 dark:hover:bg-[#28292b] hover:text-white"
              }`}
              onClick={() => setSelected("Account")}
            >
              <UserRound strokeWidth={1.2} className="h-5 w-5" />
              <p className="font-light">Account</p>
            </div>
            {/* <div
              className={`flex gap-2 text-sm text-left font-light cursor-pointer rounded-xl px-4 py-3 text-neutral-400 ${selected === "Appearance" ? "bg-neutral-700 dark:bg-[#28292b] text-white" : "hover:bg-neutral-700 dark:hover:bg-[#28292b] hover:text-white"}`}
              onClick={() => setSelected("Appearance")}
            >
              <Highlighter strokeWidth={1.2} className="h-5 w-5" />
              <p className="font-light">Highlighter</p>
            </div>
            <div
              className={`flex gap-2 text-sm text-left font-light hover:bg-neutral-700 dark:hover:bg-[#28292b] cursor-pointer rounded-xl px-4 py-3 text-neutral-400 ${selected === "Data" ? "bg-neutral-700 dark:bg-[#28292b] text-white" : "hover:bg-neutral-700 dark:hover:bg-[#28292b] hover:text-white"}`}
              onClick={() => setSelected("Data")}
            >
              <Database strokeWidth={1.2} className="h-5 w-5 " />
              <p className="font-light">Data</p>
            </div> */}
          </div>
          {selected === "Account" && (
            <div className="mx-5">
              <div className="mt-5 flex flex-row items-center justify-left">
                <Avatar className="w-12 h-12 rounded-full">
                  <Image
                    src={user?.image || Default}
                    alt=""
                    className="w-full h-full rounded-full"
                    width={100}
                    height={100}
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <div className="ml-3 justify-center">
                  <p className="text-left font-semibold">{user?.name}</p>
                  <p className="text-xs mt-1">{user?.email}</p>
                </div>
              </div>
              <div className="flex flex-col space-y-2 mt-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-muted-foreground">
                      Choose your preferred theme
                    </p>
                  </div>
                  <div className="flex flex-row items-center bg-neutral-200 dark:bg-[#2b2a2c] rounded-sm relative w-fit p-[1px] ml-5">
                    <motion.div
                      className="absolute bg-white dark:bg-[#3e3d3e] rounded-sm shadow-sm"
                      initial={false}
                      animate={{
                        x: theme === "system" ? 1 : theme === "light" ? 37 : 72,
                        width: 35,
                        height: 30,
                        y: 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                    <motion.div
                      className="p-2 rounded-full cursor-pointer relative z-10 flex items-center justify-center w-9 h-8 outline-none"
                      onClick={() => setTheme("system")}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      <Monitor className="w-4 h-4" />
                    </motion.div>
                    <motion.div
                      className="p-2 rounded-full cursor-pointer relative z-10 flex items-center justify-center w-9 h-8 outline-none"
                      onClick={() => setTheme("light")}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      <Sun className="w-4 h-4" />
                    </motion.div>
                    <motion.div
                      className="p-2 rounded-full cursor-pointer relative z-10 flex items-center justify-center w-9 h-8 outline-none"
                      onClick={() => setTheme("dark")}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      <Moon className="w-4 h-4" />
                    </motion.div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 px-0 py-4 mt-2">
                <div className="flex flex-row items-center justify-between bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-neutral-200 dark:bg-[#323233]">
                      <DollarSign
                        size={14}
                        className="text-neutral-600 dark:text-neutral-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Credits
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Default 100 credits
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-200 dark:bg-[#323233] px-3 py-2 rounded-full">
                    {credits.credits}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 text-left mt-2">
                    Add credits through coupon code
                  </p>
                  <div className="flex flex-row items-center justify-between gap-2 mt-1">
                    <Input
                      placeholder="Enter coupon code"
                      className="w-full border border-neutral-200 dark:border-neutral-700"
                      type="text"
                      value={coupon}
                      onChange={(e) => {
                        setCoupon(e.target.value);
                        setCouponError("");
                      }}
                    />
                    <Button
                      variant="default"
                      className="w-fit"
                      onClick={addCoupon}
                      disabled={couponLoading}
                    >
                      {couponLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Add"
                      )}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1 text-left">
                      {couponError}
                    </p>
                  )}
                </div>
              </div>
              <Button
                className="mt-5 w-[100px] cursor-pointer"
                onClick={() => handleLogout()}
                variant={"destructive"}
              >
                {logOutLading ? (
                  <svg
                    fill="#000000"
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    width="900px"
                    height="900px"
                    viewBox="0 0 26.349 26.35"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <style>
                      {`
                                      @keyframes spin {
                                        from {
                                          transform: rotate(0deg);
                                        }
                                        to {
                                          transform: rotate(360deg);
                                        }
                                      }
                                  `}
                    </style>
                    <g>
                      <g>
                        <circle cx="13.792" cy="3.082" r="3.082" />
                        <circle cx="13.792" cy="24.501" r="1.849" />
                        <circle cx="6.219" cy="6.218" r="2.774" />
                        <circle cx="21.365" cy="21.363" r="1.541" />
                        <circle cx="3.082" cy="13.792" r="2.465" />
                        <circle cx="24.501" cy="13.791" r="1.232" />
                        <path d="M4.694,19.84c-0.843,0.843-0.843,2.207,0,3.05c0.842,0.843,2.208,0.843,3.05,0c0.843-0.843,0.843-2.207,0-3.05 C6.902,18.996,5.537,18.988,4.694,19.84z" />
                        <circle cx="21.364" cy="6.218" r="0.924" />
                      </g>
                    </g>
                  </svg>
                ) : (
                  <>
                    <LogOutIcon
                      strokeWidth={1.2}
                      className="h-5 w-5 text-white"
                    />
                    <p className="font-light text-white">Logout</p>
                  </>
                )}
              </Button>
            </div>
          )}
          {selected === "Data" && (
            <div className="space-y-4">
              {/* Row 1: Improve Model */}
              <div className="flex flex-row mx-5 items-center justify-between">
                {/* Left side (Text) - Takes available space */}
                <div className="flex-1 mr-4">
                  <p className="text-sm font-bold">Improve the Model</p>
                  <p className="text-sm mt-2">
                    By allowing your data to be used for training our models,
                    you help enhance your own experience and improve the quality
                    of the model for all users. We take measures to ensure your
                    privacy is protected throughout the process.
                  </p>
                </div>
                {/* Right side (Switch) - Doesn't shrink, content width */}
                <div className="flex-shrink-0 mx-4">
                  <Switch id="airplane-mode" defaultChecked />
                  {/* Checking can be accessed by the checked={true}*/}
                </div>
              </div>

              {/* Row 2: Export Data */}
              <div className="flex flex-row mx-5 items-center justify-between">
                {/* Left side (Text) */}
                <div className="flex-1 mr-4">
                  <p className="text-sm font-bold">Export Account Data</p>
                  <p className="text-sm mt-2">
                    You can download all data associated with your account
                    below. This data includes everything stored in all xAI
                    products.
                  </p>
                </div>
                {/* Right side (Button) */}
                <div className="flex-shrink-0">
                  <Button
                    variant="secondary"
                    className="rounded-4xl border border-neutral-500"
                  >
                    Export
                  </Button>
                </div>
              </div>

              {/* Row 3: Delete Conversations */}
              <div className="flex flex-row mx-5 items-center justify-between">
                {/* Left side (Text) */}
                <div className="flex-1 mr-4">
                  <p className="text-sm font-bold">Delete All Conversations</p>
                  <p className="text-sm mt-2">
                    Permanently remove all records of your conversations and any
                    associated logs from servers.
                  </p>
                </div>
                {/* Right side (Button) */}
                <div className="flex-shrink-0">
                  <Button
                    variant="secondary"
                    className="rounded-4xl border border-neutral-400"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Row 4: Delete Account */}
              <div className="flex flex-row mx-5 items-center justify-between">
                {/* Left side (Text) */}
                <div className="flex-1 mr-4">
                  <p className="text-sm font-bold">Delete Account</p>
                  <p className="text-sm mt-2">
                    Permanently delete your account and associated data from the
                    xAI platform. Deletions are immediate and cannot be undone.
                  </p>
                </div>
                {/* Right side (Button) */}
                <div className="flex-shrink-0">
                  <Button
                    variant="secondary"
                    className="rounded-4xl border border-red-400 text-red-400"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
