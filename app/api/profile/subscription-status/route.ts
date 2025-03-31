import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile via Prisma
    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
      select: { subscriptionTier: true },
    });

    // If no profile found, return null
    if (!profile) {
      return NextResponse.json({ subscription: null });
    }

    return NextResponse.json({ subscription: profile });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch subscription details.";
    console.error("Error fetching subscription:", errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}