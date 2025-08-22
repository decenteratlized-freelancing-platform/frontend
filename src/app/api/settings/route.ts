import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      email,
      fullName,
      role,
      professionalTitle,
      titleLocked,
      hourlyRate,
      availableForJobs,
      privacy,
      notifications,
      skills,
      phone,
      location,
      portfolioWebsite,
      professionalBio,
    } = body;

    console.log("Received request with email:", email); // Debug log

    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    // First, let's check if the user exists
    const existingUser = await User.findOne({ email });
    console.log("Existing user found:", existingUser ? "Yes" : "No"); // Debug log
    
    if (!existingUser) {
      console.log("No user found with email:", email); // Debug log
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const update: any = {};
    
    // Update basic user fields
    if (fullName !== undefined) update.fullName = fullName;
    if (role !== undefined) update.role = role;
    if (phone !== undefined) update.phone = phone;
    if (location !== undefined) update.location = location;
    if (portfolioWebsite !== undefined) update.portfolioWebsite = portfolioWebsite;
    if (professionalBio !== undefined) update.professionalBio = professionalBio;

    // Update settings fields
    if (professionalTitle !== undefined) update["settings.professionalTitle"] = professionalTitle;
    if (titleLocked !== undefined) update["settings.titleLocked"] = Boolean(titleLocked);
    if (hourlyRate !== undefined) update["settings.hourlyRate"] = Number(hourlyRate || 0);
    if (availableForJobs !== undefined) update["settings.availableForJobs"] = availableForJobs !== false;

    if (privacy) update["settings.privacy"] = privacy;
    if (notifications) update["settings.notifications"] = notifications;
    
    // Convert skills array to string for the model
    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        update["settings.skills"] = skills.join(", ");
      } else {
        update["settings.skills"] = skills;
      }
    }

    console.log("Updating user with:", { email, update }); // Debug log

    const user = await User.findOneAndUpdate(
      { email }, 
      { $set: update }, 
      { new: true, upsert: false }
    );
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Settings updated successfully", 
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        settings: user.settings
      }
    });
  } catch (err: any) {
    console.error("Settings update error:", err);
    return NextResponse.json({ 
      message: err?.message || "Server error",
      error: err.toString()
    }, { status: 500 });
  }
}

// Strong typing for lean() result
type UserLean = {
  phone?: string;
  location?: string;
  portfolioWebsite?: string;
  professionalBio?: string;
  fullName: string;
  email: string;
  image?: string | null;
  settings?: any;
  role: string;
};

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    
    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    const user = (await User.findOne({ email })
      .select("fullName email image settings role phone location portfolioWebsite professionalBio")
      .lean()) as UserLean | null;
      
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    // Convert skills string back to array for the frontend
    const skillsArray = user.settings?.skills ? user.settings.skills.split(", ").filter(Boolean) : [];
    
    return NextResponse.json({
      profile: { 
        fullName: user.fullName, 
        email: user.email, 
        image: user.image,
        phone: user.phone || "",
        location: user.location || "",
        portfolioWebsite: user.portfolioWebsite || "",
        professionalBio: user.professionalBio || "",
      },
      settings: {
        ...user.settings,
        skills: skillsArray, // Send as array to frontend
      },
      role: user.role,
    });
  } catch (err: any) {
    console.error("Settings fetch error:", err);
    return NextResponse.json({ 
      message: err?.message || "Server error",
      error: err.toString()
    }, { status: 500 });
  }
} 