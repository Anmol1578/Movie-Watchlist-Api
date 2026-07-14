import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
// import { generateToken } from "../utils/generateToken.js";

const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Debug logging
  console.log("Registration Payload:", req.body);
  console.log("Email:", email);
  console.log("Type:", typeof email);

  try {
    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email: email },
    });

    if (userExists) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT Token
    // const token = generateToken(user.id, res);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          name: name,
          email: email,
        },
        // token,
      },
    });
  } catch (error) {
    console.error("Registration endpoint crash:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error during registration" });
  }
};

export { register };
