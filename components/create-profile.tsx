// components/CreateProfileOnSignIn.tsx

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";

export default function CreateProfileOnSignIn() {
  const { isLoaded, isSignedIn } = useUser();
  const [profileChecked, setProfileChecked] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/create-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.json();
    },
    onSuccess: () => {
      console.log("Profile created successfully");
    },
    onError: (error) => {
      console.error("Error creating profile:", error);
    },
  });

  useEffect(() => {
    async function checkProfile() {
      if (isLoaded && isSignedIn && !profileChecked) {
        try {
          const res = await fetch("/api/check-profile", {
            method: "GET",
          });
          const data = await res.json();

          if (!data.exists) {
            mutate();
          } else {
            console.log("Profile already exists");
          }

          setProfileChecked(true);
        } catch (error) {
          console.error("Error checking profile:", error);
        }
      }
    }

    checkProfile();
  }, [isLoaded, isSignedIn, profileChecked, mutate]);

  return null;
}