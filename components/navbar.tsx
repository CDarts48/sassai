// app/components/NavBar.js

"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser, SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";

export default function NavBar() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    // Optionally, return a loading indicator or skeleton here
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <Image
            className="transition-transform group-hover:scale-105"
            src="/globe.svg" // Ensure this path is correct or replace with your logo path
            width={50}
            height={50}
            alt="Logo"
          />
          <span className="text-xl font-bold text-white tracking-tight">InvestmentAI</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          {/* Authentication Buttons */}
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 font-medium text-sm tracking-wide uppercase"
            >
              Dashboard
            </Link>
            <Link
              href="/investmentplan"
              className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 font-medium text-sm tracking-wide uppercase"
            >
              Investment Plan
            </Link>
            {/* Profile Picture */}
            {user?.imageUrl ? (
              <Link href="/profile" className="ml-4">
                <Image
                  src={user.imageUrl}
                  alt="Profile Picture"
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-slate-600 hover:border-emerald-400 transition-colors duration-200"
                />
              </Link>
            ) : (
              // Placeholder for users without a profile picture
              <div className="w-9 h-9 bg-slate-600 rounded-full border-2 border-slate-500 ml-4"></div>
            )}

            {/* Sign Out Button */}
            <SignOutButton>
              <button className="ml-4 px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                Sign Out
              </button>
            </SignOutButton>
          </SignedIn>

          <SignedOut>
            <Link
              href="/"
              className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 font-medium text-sm tracking-wide"
            >
              Home
            </Link>
            <Link
              href={isSignedIn ? "/subscribe" : "/sign-up"}
              className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 font-medium text-sm tracking-wide"
            >
              Subscribe
            </Link>

            <Link
              href="/sign-up"
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-semibold rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl border border-emerald-500/20"
            >
              Sign Up
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}