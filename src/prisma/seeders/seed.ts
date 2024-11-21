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
          joinDate: new Date("2020-01-01"),
          imageUrl: "https://example.com/images/john.jpg",
          jobTitle: "Software Engineer",
          jobDepartment: "Engineering",
          jobBranch: "Headquarters",
          isPremium: true,
          premiumExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
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
          joinDate: new Date("2019-06-01"),
          imageUrl: "https://example.com/images/jane.jpg",
          jobTitle: "Product Manager",
          jobDepartment: "Product",
          jobBranch: "Regional Office",
          isPremium: true,
          premiumExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
      },
    },
  });

  // Create Assessments for User 1
  const assessment1 = await prisma.assessment.create({
    data: {
      name: "Personality Test",
      description: "A basic personality assessment",
      imageUrl: "https://example.com/images/assessment1.jpg",
      duration: 30,
      userId: user1.id,
      price: 0.0,
      isActive: true,
    },
  });

  const assessment2 = await prisma.assessment.create({
    data: {
      name: "Skills Evaluation",
      description: "Evaluate your technical skills",
      imageUrl: "https://example.com/images/assessment2.jpg",
      duration: 45,
      userId: user1.id,
      price: 10.0,
      isActive: true,
    },
  });

  // Create Questions for Assessments
  await prisma.question.createMany({
    data: [
      { order: 1, assessmentId: assessment1.id, text: "How often do you take risks?", type: "SCALE", options: JSON.stringify([1, 2, 3, 4, 5]) },
      { order: 2, assessmentId: assessment1.id, text: "How well do you manage stress?", type: "SCALE", options: JSON.stringify([1, 2, 3, 4, 5]) },
      { order: 1, assessmentId: assessment2.id, text: "Rate your coding skills.", type: "SCALE", options: JSON.stringify([1, 2, 3, 4, 5]) },
      { order: 2, assessmentId: assessment2.id, text: "Rate your problem-solving skills.", type: "SCALE", options: JSON.stringify([1, 2, 3, 4, 5]) },
    ],
  });

  // Create Results for User 2
  await prisma.result.create({
    data: {
      userId: user2.id,
      assessmentId: assessment1.id,
      score: JSON.stringify({ total: 8, average: 4 }),
      timeDuration: 25,
      answers: JSON.stringify([
        { questionId: 1, answer: 4 },
        { questionId: 2, answer: 4 },
      ]),
      status: "COMPLETED",
      skills: JSON.stringify(["Risk-taking", "Stress Management"]),
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
