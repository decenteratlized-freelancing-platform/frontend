import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const {
      email,
      language,
      timezone,
      currency,
      availabilityStatus,
      hourlyRate,
      workSchedule,
    } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    const update: any = {};
    
    if (language) update["settings.language"] = language;
    if (timezone) update["settings.timezone"] = timezone;
    if (currency) update["settings.currency"] = currency;
    if (availabilityStatus) update["settings.availabilityStatus"] = availabilityStatus;
    if (hourlyRate !== undefined) update["settings.hourlyRate"] = Number(hourlyRate);
    if (workSchedule) update["settings.workSchedule"] = workSchedule;

    const user = await User.findOneAndUpdate(
      { email },
      { $set: update },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Preferences updated successfully", user });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { message: err?.message || "Server error" },
      { status: 500 }
    );
  }
} 