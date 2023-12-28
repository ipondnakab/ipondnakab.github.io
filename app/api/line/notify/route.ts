import { lineNotify } from "@/app/services/line";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json("api works!");
}

export async function POST(request: Request) {
  try {
    const res = await request.json();
    const { name, email, content } = res;
    await lineNotify({
      message: `\nName:\n\t${name}\nEmail:\n\t${email}\nContent:\n\t${content}`,
    });
    return NextResponse.json("sent message to line notify successfully!!");
  } catch (error) {
    return NextResponse.json(error);
  }
}
