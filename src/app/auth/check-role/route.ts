import {connectDB} from '@/lib/connectDB';
import User from '@/models/User';
import { NextResponse, NextRequest} from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ message: "Missing email or role" }, { status: 400 });
    }

    await User.updateOne({ email }, { role });

    return NextResponse.json({ message: "Role updated successfully" });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}