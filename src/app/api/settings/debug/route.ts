import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    
    if (email) {
      // Check specific email
      const user = await User.findOne({ email }).select("email fullName role favorites favoriteJobs");
      return NextResponse.json({ 
        found: !!user, 
        user: user ? { 
            email: user.email, 
            fullName: user.fullName, 
            role: user.role,
            favoritesCount: user.favorites?.length || 0,
            favoriteJobsCount: user.favoriteJobs?.length || 0,
            favorites: user.favorites,
            favoriteJobs: user.favoriteJobs
        } : null 
      });
    } else {
      // List all users (be careful with this in production)
      const users = await User.find({}).select("email fullName role").limit(10);
      return NextResponse.json({ 
        totalUsers: users.length, 
        users: users.map(u => ({ email: u.email, fullName: u.fullName, role: u.role }))
      });
    }
  } catch (err: any) {
    console.error("Debug error:", err);
    return NextResponse.json({ 
      message: err?.message || "Server error",
      error: err.toString()
    }, { status: 500 });
  }
} 