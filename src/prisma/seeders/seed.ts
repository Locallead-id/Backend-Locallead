import prisma from "../../database/prisma";
import { hashPassword } from "../../helpers/bcrypt";

async function main() {
  // Create Users with Profiles

  const user1 = await prisma.user.create({
    data: {
      email: "user1@example.com",
      password: hashPassword("password123"),
      role: "USER",
      profile: {
        create: {
          fullName: "John Doe",
          address: "123 Main St",
          dateOfBirth: new Date("1990-01-01"),
          imageUrl: "https://example.com/images/john.jpg",
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "user2@example.com",
      password: hashPassword("password456"),
      role: "USER",
      profile: {
        create: {
          fullName: "Jane Smith",
          address: "456 Elm St",
          dateOfBirth: new Date("1985-05-15"),
          imageUrl: "https://example.com/images/jane.jpg",
        },
      },
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "user3@example.com",
      password: hashPassword("password456"),
      role: "USER",
      profile: {
        create: {
          fullName: "Jane Smith",
          address: "456 Elm St",
          dateOfBirth: new Date("1985-05-15"),
          imageUrl: "https://example.com/images/jane.jpg",
        },
      },
    },
  });
  const admin1 = await prisma.user.create({
    data: {
      email: "admin1@example.com",
      password: hashPassword("password123"),
      role: "ADMIN",
      profile: {
        create: {
          fullName: "ADMIN 1",
          address: "123 Main St",
          dateOfBirth: new Date("1990-01-01"),
          imageUrl: "https://example.com/images/john.jpg",
        },
      },
    },
  });

  // Create Assessments for User 1
  const assessment1 = await prisma.assessment.create({
    data: {
      name: "Post-Concussion Symptom Scale ( PCSS )",
      description: "An assessment designed to evaluate symptoms commonly associated with concussions, helping track recovery progress.",
      imageUrl: "https://raw.githubusercontent.com/RezaConz/Mocci/refs/heads/master/3d-geometric-abstract-background.png",
      duration: 30,
      userId: user1.id,
      price: 500,
      isActive: true,
    },
  });

  // Create Questions for Assessments
  await prisma.question.createMany({
    data: [
      {
        order: 1,
        assessmentId: assessment1.id,
        text: "Saya menerima umpan balik positif tentang kinerja saya dari berbagai pihak",
        type: "SCALE",
        options: [1, 2, 3, 4, 5],
      },
      {
        order: 2,
        assessmentId: assessment1.id,
        text: "Saya sepenuhnya didukung oleh manajemen dalam pekerjaan saya",
        type: "SCALE",
        options: [1, 2, 3, 4, 5],
      },
      {
        order: 3,
        assessmentId: assessment1.id,
        text: "Saya paling bahagia ketika saya sedang bekerja",
        type: "SCALE",
        options: [1, 2, 3, 4, 5],
      },
      {
        order: 4,
        assessmentId: assessment1.id,
        text: "Saya menerima evaluasi kinerja yang baik",
        type: "SCALE",
        options: [1, 2, 3, 4, 5],
      },
      {
        order: 5,
        assessmentId: assessment1.id,
        text: "Saya diterima oleh teman-teman saya",
        type: "SCALE",
        options: [1, 2, 3, 4, 5],
      },
      {
        order: 6,
        assessmentId: assessment1.id,
        text: "Saya memiliki kepercayaan atasan saya",
        type: "SCALE",
        options: [1, 2, 3, 4, 5],
      },
      {
        order: 7,
        assessmentId: assessment1.id,
        text: "Saya bahagia dengan kehidupan pribadi saya",
        type: "SCALE",
        options: [1, 2, 3, 4, 5],
      },
      {
        order: 8,
        assessmentId: assessment1.id,
        text: "Saya menikmati aktivitas saya diluar pekerjaan",
        type: "SCALE",
        options: [1, 2, 3, 4, 5],
      },
      {
        order: 9,
        assessmentId: assessment1.id,
        text: "Saya puas dengan hidup saya secara keseluruhan",
        type: "SCALE",
        options: [1, 2, 3, 4, 5],
      },
    ],
  });

  // Create Results for User 2
  await prisma.result.create({
    data: {
      userId: user2.id,
      assessmentId: assessment1.id,
      score: { total: 8, average: 4 },
      timeDuration: 25,
      answers: [1, 2, 3, 4, 5],
      status: "COMPLETED",
      skills: ["Risk-taking", "Stress Management"],
      startedAt: new Date("2023-10-01T10:00:00Z"),
      completedAt: new Date("2023-10-01T10:25:00Z"),
    },
  });

  console.log("Seed data successfully created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
