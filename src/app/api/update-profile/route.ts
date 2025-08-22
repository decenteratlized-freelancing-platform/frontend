// /app/api/update-profile/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { fullName, role, notifications, privacy } = body;

  const updatedUser = await User.findOneAndUpdate(
    { email: session.user.email },
    { name: fullName, role, notifications, privacy },
    { new: true }
  );

  if (!updatedUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Profile updated", user: updatedUser });
}
