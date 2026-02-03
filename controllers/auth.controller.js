import {
  loginUser,
  registerUser,
  selectTenant
} from "../services/auth.service.js";

import { sendWelcomeEmail } from "../services/welcomeEmail.service.js";

/// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const { user, token } = await registerUser({ name, email, password });

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    /*  Send Welcome Email (correct way) */
    try {
      await sendWelcomeEmail({
        email,
        name,
        loginLink: `${process.env.FRONTEND_URL}/login`,
      });
    } catch (err) {
      console.error("Welcome email failed:", err.message);
    }

    res.status(201).json({
      success: true,
      data: { user: safeUser, token },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/* LOGIN */
// export const login = async (req, res) => {
//   const result = await loginUser(req.body);
//   res.json(result); // { user, organizations }
// };

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await loginUser({ email, password });

    const safeUser = { id: user._id, role: user.role, name: user.name, email: user.email };

    return res.json({
      success: true,
      message: "Login successful",
      data: { user: safeUser, token }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};

/* SELECT TENANT → issue JWT */
export const chooseTenant = async (req, res) => {
  const { token } = await selectTenant({
    userId: req.user.id,
    organizationId: req.body.organizationId,
  });

  res.json({ token });
};
