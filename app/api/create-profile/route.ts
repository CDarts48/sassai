import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "User not found in Clerk." },
        { status: 404 }
      );
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
    if (!email) {
      return NextResponse.json(
        { error: "User does not have an email address." },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });

    if (existingProfile) {
      // Profile already exists
      return NextResponse.json({ message: "Profile already exists." });
    }

    // Otherwise, create the profile
    await prisma.profile.create({
      data: {
        userId: clerkUser.id,
        email,
        subscriptionActive: false,
        subscriptionTier: null,
        stripeSubscriptionId: null,
      },
    });

    console.log(`Prisma profile created for user: ${clerkUser.id}`);
    return NextResponse.json(
      { message: "Profile created successfully." },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error in create-profile API:", errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}