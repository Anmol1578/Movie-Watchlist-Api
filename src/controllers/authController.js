import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

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

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT Token
    const token = generateToken(user.id, res);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration endpoint crash:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error during registration" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // Check if user email exist in the table

  const userExists = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!userExists) {
    return res.status(400).json({ error: "Invalid Email or password" });
  }

  //verify password
  const isPasswordValid = await bcrypt.compare(password, userExists.password);

  if (!isPasswordValid) {
    return res.status(400).json({ error: "Invalid Email or password" });
  }

  const token = generateToken(userExists.id, res);

  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: userExists.id,
        email: userExists.email,
      },
      token,
    },
  });
};

const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    status: "success",
    message: "Logged out Successfully",
  });
};

export { register, login, logout };
