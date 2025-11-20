import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOptions";
import { connectDB } from "@/lib/connectDB";
import User from "@/models/User";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { imageUrl, email: manualEmail } = body;

  // Support both NextAuth session and manual login
  const userEmail = session?.user?.email || manualEmail;

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized - Email required" }, { status: 401 });
  }

  // Allow null or empty string to remove image
  // if (!imageUrl) {
  //   return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
  // }

  try {
    await connectDB();

    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          image: imageUrl,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      image: updatedUser.image,
      message: "Profile image updated successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

