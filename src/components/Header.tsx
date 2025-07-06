"use client";
import {
  LogOutIcon,
  Monitor,
  Moon,
  SettingsIcon,
  SquarePen,
  Sun,
  TextSearch,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Button } from "./ui/button";
import ChatHistory from "./ChatHistory/Mobile";
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

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  isShared: boolean;
  userId: string;
  category: string;
  customChatId: string;
  isDisabled: boolean;
}

export default function Header({
  chats,
  chatLoadings,
}: {
  chats: Chat[];
  chatLoadings: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const [openChatHistoryDrawer, setOpenChatHistoryDrawer] = useState(false);
  const [logOutLading, setLogOutLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const { credits } = useCredits();
  const { user, setUser } = useUserStore();
  const applyCouponMutation = useMutation(api.coupon.applyCoupon);
  const { signOut } = useAuthActions();
  const router = useRouter();

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
        // Set defaults if parsing fails
      }
    } else {
      // Set defaults if nothing in local storage
      console.warn(
        "userRateLimit not found in localStorage. Using default values."
      );
    }
  }, []);

  return (
    <div className="w-full block">
      <div
        className={`flex flex-row items-center justify-between w-full max-w-full bg-transparent top-0`}
      >
        <div>
          {/* <h1 className='text-3xl font-bold text-white ml-2'>Logo</h1> */}
        </div>
        <div
          id={"desktop-menu"}
          className="flex flex-row px-4 justify-center items-center"
        >
          <div
            id={"mobile-menu"}
            className="flex-row pt-2 justify-center items-center flex"
          >
            <div
              className="p-3 hover:bg-neutral-200 dark:hover:bg-[#36383a] cursor-pointer rounded-full"
              onClick={() => {
                const currentSearchParams = new URLSearchParams(
                  window.location.search
                );
                document.title = "Old Sparrow";
                currentSearchParams.delete("chatId");
                currentSearchParams.set("new", "true");
                window.history.pushState(
                  {},
                  "",
                  `/chat?${currentSearchParams}`
                );
              }}
            >
              <SquarePen
                className="w-4 h-4 dark:text-white"
                strokeWidth={2.8}
              />
            </div>
            <Drawer
              open={openChatHistoryDrawer}
              onOpenChange={setOpenChatHistoryDrawer}
            >
              <DrawerTrigger className="outline-none">
                <div className="p-3 hover:bg-neutral-200 dark:hover:bg-[#36383a] cursor-pointer rounded-full outline-none">
                  <TextSearch
                    className="w-5 h-5 dark:text-white"
                    strokeWidth={2.5}
                  />
                </div>
              </DrawerTrigger>
              <DrawerContent className="w-full dark:bg-[#1d1e20] rounded-t-2xl ">
                <DrawerTitle></DrawerTitle>
                <ChatHistory
                  chats={chats}
                  chatLoadings={chatLoadings}
                  onClose={() => {
                    setOpenChatHistoryDrawer(false);
                  }}
                />
              </DrawerContent>
            </Drawer>
            <Drawer>
              <DrawerTrigger className="outline-none">
                <div className="p-3 hover:bg-neutral-200 dark:hover:bg-[#36383a] cursor-pointer rounded-full outline-none">
                  <SettingsIcon
                    className="w-[17px] h-[17px] dark:text-white outline-none"
                    strokeWidth={2.5}
                  />
                </div>
              </DrawerTrigger>
              <DrawerContent className="w-full dark:bg-[#1d1e20] rounded-t-2xl">
                <DrawerTitle></DrawerTitle>
                <Tabs defaultValue="account" className="mt-5 min-h-[560px]">
                  <TabsList className="w-[90%] mx-auto mb-3">
                    <TabsTrigger value="account">Account</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account">
                    <div className="flex justify-center items-center flex-col">
                      <div className="mt-5 flex flex-row items-center mx-5 justify-center">
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
                          <p className="text-left">{user?.name}</p>
                          <p className="text-xs mt-1">{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 mt-5 w-[320px]">
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
                                x:
                                  theme === "system"
                                    ? 1
                                    : theme === "light"
                                      ? 37
                                      : 72,
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
                              className="p-2 rounded-full cursor-pointer relative z-10 flex items-center justify-center w-9 h-8"
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
                              className="p-2 rounded-full cursor-pointer relative z-10 flex items-center justify-center w-9 h-8"
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
                              className="p-2 rounded-full cursor-pointer relative z-10 flex items-center justify-center w-9 h-8"
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
                      <div className="flex flex-col gap-3 px-0 py-4 mt-2 w-[320px]">
                        <div className="flex flex-row items-center justify-between">
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
                                {credits ? credits.credits : 0} / 1000 remaining
                              </p>
                            </div>
                          </div>
                          <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-white dark:bg-[#323233] px-2 py-1 rounded-full">
                            Used {credits ? 100 - credits.credits : 0}%
                          </div>
                        </div>
                        <div className="w-full">
                          <div className="w-full h-[5px] bg-neutral-200 dark:bg-[#323233] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-neutral-700 to-neutral-900 dark:from-neutral-300 dark:to-neutral-400 rounded-full transition-all duration-500 ease-out shadow-sm"
                              style={{
                                width: `${credits ? 100 - credits.credits : 0}%`,
                              }}
                            />
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
                        className="mt-10 w-[100px] cursor-pointer outline-none"
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
                              className="h-5 w-5 text-white outline-none"
                            />
                            <p className="font-light text-white">Logout</p>
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="data">
                    <div className="space-y-4">
                      <div className="flex flex-row mx-5 items-center justify-between">
                        <div className="flex-1 mr-4">
                          <p className="text-sm font-bold">Improve the Model</p>
                          <p className="text-sm mt-2">
                            By allowing your data to be used for training our
                            models, you help enhance your own experience and
                            improve the quality of the model for all users. We
                            take measures to ensure your privacy is protected
                            throughout the process.
                          </p>
                        </div>
                        <div className="flex-shrink-0 mx-4">
                          <Switch id="airplane-mode" defaultChecked />
                        </div>
                      </div>

                      <div className="flex flex-row mx-5 items-center justify-between">
                        <div className="flex-1 mr-4">
                          <p className="text-sm font-bold">
                            Export Account Data
                          </p>
                          <p className="text-sm mt-2">
                            You can download all data associated with your
                            account below. This data includes everything stored
                            in all xAI products.
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            variant="secondary"
                            className="rounded-4xl border border-neutral-500"
                          >
                            Export
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-row mx-5 items-center justify-between">
                        <div className="flex-1 mr-4">
                          <p className="text-sm font-bold">
                            Delete All Conversations
                          </p>
                          <p className="text-sm mt-2">
                            Permanently remove all records of your conversations
                            and any associated logs from servers.
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            variant="secondary"
                            className="rounded-4xl border border-neutral-400"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-row mx-5 items-center justify-between">
                        <div className="flex-1 mr-4">
                          <p className="text-sm font-bold">Delete Account</p>
                          <p className="text-sm mt-2">
                            Permanently delete your account and associated data
                            from the xAI platform. Deletions are immediate and
                            cannot be undone.
                          </p>
                        </div>
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
                  </TabsContent>
                </Tabs>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </div>
  );
}
