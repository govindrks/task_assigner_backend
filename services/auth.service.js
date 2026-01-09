import { hashPassword, comparePassword } from "../utils/password.util.js";
import { generateToken } from "../utils/jwt.util.js";
import { User } from "../models/user.model.js";

export const registerUser = async ({ name, email, password, role, adminSecret }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Email already in use");
  }

  if (role && role === "ADMIN") {
    const adminSecretEnv = process.env.ADMIN_SECRET;
    if (!adminSecretEnv) {
      throw new Error("Admin creation is disabled on this server");
    }
    if (!adminSecret || adminSecret !== adminSecretEnv) {
      throw new Error("Invalid admin secret");
    }
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({ name, email, passwordHash, role: role || "USER" });

  const token = generateToken({ id: user._id, role: user.role, email: user.email });

  return { user, token };
};



export const loginUser = async ({ email, password }) => {

   if (!email || !password) {
    throw new Error("email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Match not found: Invalid email or password");
  }

  const token = generateToken({ id: user._id, email: user.email, role: user.role });

  return { user, token };
};
