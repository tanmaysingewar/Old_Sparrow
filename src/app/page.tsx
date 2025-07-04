"use client";
import Image from "next/image";
import Link from "next/link";
import family from "@/assets/family.jpg";
import os from "@/assets/os.png";
import { Libre_Baskerville, Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function LandingPage() {
  const features = [
    {
      icon: "🏥",
      title: "Policy Analysis",
      description:
        "Upload documents and get instant insights about your coverage and benefits.",
    },
    {
      icon: "💬",
      title: "AI Assistant",
      description:
        "Ask questions about your health insurance anytime, get clear answers.",
    },
    {
      icon: "💰",
      title: "Cost Transparency",
      description:
        "Understand your costs before procedures and find in-network providers.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div
              className={`text-xl font-bold text-gray-900 ${libreBaskerville.className} flex items-center space-x-2`}
            >
              <div className="max-w-2xl mx-auto mb-1">
                <div className="overflow-hidden">
                  <Image
                    src={os}
                    alt="Happy family"
                    width={30}
                    height={200}
                    className="mr-1"
                    priority
                  />
                </div>
              </div>
              <p className="text-base md:text-xl font-bold text-gray-900">
                Old Sparrow
              </p>
            </div>
            <div className="items-center space-x-3 hidden md:flex">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className={`${poppins.className} text-gray-600`}
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/chat?new=true">
                <Button
                  className={`${poppins.className} bg-gray-900 hover:bg-gray-800 text-white`}
                >
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-3 md:hidden">
              <Link href="/chat?new=true">
                <Button
                  className={`${poppins.className} bg-gray-900 hover:bg-gray-800 text-white`}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <h1
              className={`text-3xl lg:text-4xl font-bold text-gray-900 leading-tight ${libreBaskerville.className}`}
            >
              Your Health Insurance Assistant
            </h1>
            <p
              className={`text-base text-gray-600 leading-relaxed ${poppins.className} max-w-xl mx-auto`}
            >
              Stop struggling with complex insurance documents. Get instant,
              personalized answers about your health coverage.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/chat?new=true">
                <Button
                  size="lg"
                  className={`text-lg px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white ${poppins.className}`}
                >
                  Try It Free
                </Button>
              </Link>
            </div>
          </div>
          <div className="max-w-2xl mx-auto mb-1 mt-15">
            <div className="rounded-lg overflow-hidden">
              <Image
                src={family}
                alt="Happy family"
                width={400}
                height={200}
                className="mx-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className={`text-3xl font-bold text-gray-900 ${libreBaskerville.className}`}
            >
              Simple. Fast. Reliable.
            </h2>
            <p className={`text-lg text-gray-600 mt-4 ${poppins.className}`}>
              Everything you need to understand your health insurance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="text-3xl">{feature.icon}</div>
                <h3
                  className={`text-lg font-semibold text-gray-900 ${libreBaskerville.className}`}
                >
                  {feature.title}
                </h3>
                <p className={`text-gray-600 text-sm ${poppins.className}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className={`text-3xl font-bold text-gray-900 mb-16 ${libreBaskerville.className}`}
          >
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto">
                1
              </div>
              <h3
                className={`text-lg font-semibold text-gray-900 ${libreBaskerville.className}`}
              >
                Upload Documents
              </h3>
              <p className={`text-gray-600 text-sm ${poppins.className}`}>
                Upload your insurance documents or ask questions directly.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto">
                2
              </div>
              <h3
                className={`text-lg font-semibold text-gray-900 ${libreBaskerville.className}`}
              >
                Ask Questions
              </h3>
              <p className={`text-gray-600 text-sm ${poppins.className}`}>
                Chat with our AI about coverage, benefits, or claims.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto">
                3
              </div>
              <h3
                className={`text-lg font-semibold text-gray-900 ${libreBaskerville.className}`}
              >
                Get Answers
              </h3>
              <p className={`text-gray-600 text-sm ${poppins.className}`}>
                Receive clear, personalized explanations instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2
            className={`text-4xl font-bold text-gray-900 ${libreBaskerville.className}`}
          >
            Ready to get started?
          </h2>
          <p className={`text-lg text-gray-600 ${poppins.className}`}>
            Join thousands who have simplified their health insurance
            experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat?new=true">
              <Button
                size="lg"
                className={`text-lg px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white ${poppins.className}`}
              >
                Start Free Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <div
            className={`text-lg font-bold text-gray-900 mb-2 ${libreBaskerville.className}`}
          >
            Old Sparrow
          </div>
          <p className={`text-gray-600 text-sm ${poppins.className}`}>
            Making health insurance simple and understandable.
          </p>
          <div className={`text-xs text-gray-500 mt-4 ${poppins.className}`}>
            © 2025 Old Sparrow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
