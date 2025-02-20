import { NextResponse } from "next/server";

export async function GET() {
  const privateKey = process.env.TEST_ADMIN_PK;

  if (!privateKey) {
    return NextResponse.json(
      { error: "Private key not found" },
      { status: 500 }
    );
  }

  return NextResponse.json({ privateKey });
}
