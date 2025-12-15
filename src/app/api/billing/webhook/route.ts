import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    return NextResponse.json({
      message: "Stripe webhook endpoint - to be implemented",
      received: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
