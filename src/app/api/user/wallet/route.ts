import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOptions";
import { connectDB } from "@/lib/connectDB";
import User from "@/models/User";
import { verifyMessage } from "ethers";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { address, message, signature, email: manualEmail } = body;

  // Support both NextAuth session and manual login
  const userEmail = session?.user?.email || manualEmail;

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized - Email required" }, { status: 401 });
  }

  try {

    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: "Address, message and signature are required" },
        { status: 400 }
      );
    }

    let recoveredAddress: string;
    try {
      recoveredAddress = verifyMessage(message, signature);
    } catch (error) {
      return NextResponse.json(
        { error: "Unable to verify signature" },
        { status: 400 }
      );
    }

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: "Signature does not match provided address" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          walletAddress: address.toLowerCase(),
          walletLinkedAt: new Date(),
          walletMessage: message,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      walletAddress: updatedUser.walletAddress,
      walletLinkedAt: updatedUser.walletLinkedAt?.toISOString?.() ?? new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

