// app/api/user/update-profile/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, phone, bio, skills } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("smarthire"); // change to your DB name

    const updated = await db.collection("users").findOneAndUpdate(
      { email },
      {
        $set: {
          firstName,
          lastName,
          phone,
          bio,
          skills,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!updated.value) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updated.value,
    });
  } catch (err) {
  const message = err instanceof Error ? err.message : "Unknown error";
  return NextResponse.json({ error: message }, { status: 500 });
}

}
