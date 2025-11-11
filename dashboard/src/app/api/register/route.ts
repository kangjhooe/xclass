import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email is already in use." }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      },
    });

    return NextResponse.json({ message: "Registration successful." }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unexpected error. Please try again." }, { status: 500 });
  }
}

