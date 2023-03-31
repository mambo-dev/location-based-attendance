import { PrismaClient, Unit } from "@prisma/client";
import * as argon2 from "argon2";
const prisma = new PrismaClient();

async function main() {
  const hash = await argon2.hash("1234", {
    hashLength: 10,
  });

  //seed courses
  const courses = await prisma.course.createMany({
    data: [
      {
        course_description:
          "this course is a bachelors in information technology",
        course_title: "Bachelors of business and information technology",
        course_short_name: "BOBIT",
      },
      {
        course_description: "this course is a bachelors in business management",
        course_title: "Bachelors of business management",
        course_short_name: "BBM",
      },
      {
        course_description: "this course is a bachelors in Computer Science",
        course_title: "Bachelors of Computer Science",
        course_short_name: "BCS",
      },
      {
        course_description: "this course is a bachelors business commerce",
        course_title: "Bachelors of business commerce",
        course_short_name: "BCOMM",
      },
    ],
  });

  const admin = await prisma.user.create({
    data: {
      user_reg_no: "ElizabethAdmin001",
      user_password: hash,
      user_role: "admin",
      Admin: {
        create: {
          admin_description: "this is me i am awesome",
          admin_email: "elizabeth@email.com",
          admin_full_name: "Elizabeth Client",
          admin_profile_picture:
            "https://images.unsplash.com/photo-1611432579699-484f7990b127?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
        },
      },
    },
  });

  //seed test users
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
