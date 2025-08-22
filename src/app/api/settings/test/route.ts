import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    console.log("Received body:", body);
    
    if (!body.email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    // Just try to find the user first
    const user = await User.findOne({ email: body.email });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "User found", 
      user: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        hasSettings: !!user.settings
      }
    });
  } catch (err: any) {
    console.error("Test error:", err);
    return NextResponse.json({ 
      message: err?.message || "Server error",
      error: err.toString()
    }, { status: 500 });
  }
}