import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  await dbConnect();

  const admins = [
    { name: "Admin", email: "admin@shophub.com", password: "Admin@123" },
    { name: "Super Admin", email: "superadmin@shophub.com", password: "SuperAdmin@123" },
  ];

  const results = [];

  for (const admin of admins) {
    const existing = await User.findOne({ email: admin.email });
    if (existing) {
      results.push({ email: admin.email, status: "already exists" });
      continue;
    }

    const hashedPassword = await bcrypt.hash(admin.password, 12);
    await User.create({
      name: admin.name,
      email: admin.email,
      password: hashedPassword,
      role: "admin",
      emailVerified: new Date(),
    });
    results.push({ email: admin.email, password: admin.password, status: "created" });
  }

  return results;
}

export async function GET() {
  try {
    const results = await seedAdmin();
    return NextResponse.json({ message: "Admin seed complete", results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const results = await seedAdmin();
    return NextResponse.json({ message: "Admin seed complete", results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
