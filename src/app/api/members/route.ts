import { NextResponse } from "next/server";
import { getLiveMembers } from "@/lib/mongodb/repos/users.repo";

export async function GET() {
  const members = await getLiveMembers();
  return NextResponse.json({ members });
}
