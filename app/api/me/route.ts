export const dynamic = "force-dynamic";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({
      where: {
        id: session?.user?.id,
      },
    });
    return NextResponse.json(user, {
      status: 200,
    });
  } catch (err) {
    return NextResponse.json(err);
  }
}

export async function POST(req: any) {
  try {
    const session = await getServerSession(authOptions);

    const user = await prisma.user.update({
      where: {
        id: session?.user?.id,
      },
      data: {
        name: req?.body?.name || undefined,
        settings: req.body?.setting || undefined,
      },
    });
    return NextResponse.json(user, {
      status: 200,
    });
  } catch (err) {
    return NextResponse.json(err);
  }
}
