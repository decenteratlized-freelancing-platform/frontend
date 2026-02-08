import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const id = searchParams.get("id");
    
    if (id) {
        const user = await User.findById(id).select("email fullName role favorites favoriteJobs");
        return NextResponse.json({ found: !!user, source: "id", user });
    }

    if (email) {
      console.log(`Debug search for email: ${email}`);
      // Check specific email (case-insensitive)
      const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).select("email fullName role favorites favoriteJobs");
      
      return NextResponse.json({ 
        found: !!user, 
        source: "email",
        queriedEmail: email,
        user: user ? { 
            id: user._id,
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
      // List all users
      const users = await User.find({}).select("email fullName role").limit(20);
      return NextResponse.json({ 
        totalUsersInSystem: await User.countDocuments(),
        recentUsers: users.map(u => ({ id: u._id, email: u.email, fullName: u.fullName, role: u.role }))
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