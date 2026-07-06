import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    await dbConnect();

    await User.findOneAndUpdate({ email: session.user.email }, { name });
    return NextResponse.json({ message: "Profile updated" });
  } catch (error) {
    console.error("PUT /api/auth/update-profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
