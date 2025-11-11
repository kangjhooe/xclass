import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@example.com",
      emailVerified: new Date(),
      password: passwordHash,
    },
  });

  await prisma.post.upsert({
    where: {
      title_authorId: {
        title: "Welcome to the Dashboard",
        authorId: user.id,
      },
    },
    update: {},
    create: {
      title: "Welcome to the Dashboard",
      content:
        "This is a starter post created by the Prisma seed script. Feel free to edit or delete it once you are up and running.",
      published: true,
      authorId: user.id,
    },
  });

  await prisma.post.upsert({
    where: {
      title_authorId: {
        title: "Draft Post",
        authorId: user.id,
      },
    },
    update: {},
    create: {
      title: "Draft Post",
      content: "Posts can be saved as drafts by toggling the published switch off when creating them.",
      published: false,
      authorId: user.id,
    },
  });

  console.log(`Seeded database with user ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

