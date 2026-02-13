import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedRoles = [
  {
    roleName: "Менеджер по продажам",
    preferredZodiacSigns: JSON.stringify(["Aries", "Leo", "Sagittarius"]),
    preferredBirthMonths: JSON.stringify([3, 7, 8, 11]),
    minAge: 23,
    maxAge: 35,
    zodiacWeight: 40,
    ageWeight: 40,
    monthWeight: 20,
  },
  {
    roleName: "Бухгалтер",
    preferredZodiacSigns: JSON.stringify(["Taurus", "Virgo", "Capricorn"]),
    preferredBirthMonths: JSON.stringify([1, 4, 9, 12]),
    minAge: 25,
    maxAge: 45,
    zodiacWeight: 45,
    ageWeight: 45,
    monthWeight: 10,
  },
  {
    roleName: "HR-специалист",
    preferredZodiacSigns: JSON.stringify(["Gemini", "Libra", "Aquarius"]),
    preferredBirthMonths: JSON.stringify([2, 5, 10]),
    minAge: 23,
    maxAge: 40,
    zodiacWeight: 40,
    ageWeight: 40,
    monthWeight: 20,
  },
];

async function main() {
  for (const role of seedRoles) {
    await prisma.roleProfile.upsert({
      where: { roleName: role.roleName },
      update: role,
      create: role,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
