import { hashPassword, comparePassword } from "../utils/password.util.js";
import { generateToken } from "../utils/jwt.util.js";
import { User } from "../models/user.model.js";
import { Membership } from "../models/Membership.model.js";

/* =====================================================
   REGISTER
   - create user only
   - NO org auto assign here
===================================================== */
export const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    throw new Error("Email already in use");
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  return { user };
};

/* =====================================================
   LOGIN
   - verify credentials
   - return org list
===================================================== */
export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const match = await comparePassword(password, user.passwordHash);
  if (!match) {
    throw new Error("Invalid email or password");
  }

  const memberships = await Membership.find({ user: user._id })
    .populate("organization", "name");

  const organizations = memberships.map((m) => ({
    id: m.organization._id,
    name: m.organization.name,
  }));

  // ALWAYS ISSUE TOKEN
  const token = generateToken({
    userId: user._id,
    organizationId: organizations.length > 0 ? organizations[0].id : null,
  });

  return { user, organizations, token };
};


/* =====================================================
   SELECT TENANT (ISSUE JWT)
===================================================== */
export const selectTenant = async ({ userId, organizationId }) => {
  const member = await Membership.exists({
    user: userId,
    organization: organizationId,
  });

  if (!member) {
    throw new Error("Not a member of this organization");
  }

  const token = generateToken({
    userId,
    organizationId,
  });

  return { token };
};
