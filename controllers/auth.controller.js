import { sendEmail } from "../email/sendEmail.js";
import { loginUser, registerUser } from "../services/auth.service.js";


export const register = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const { user, token } = await registerUser({ name, email, password, role, adminSecret });

    const safeUser = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    try {
      await sendEmail({ to: email, name });
    } catch (err) {
      console.error("Email failed:", err.message);
    }

    res.status(201).json({
      success: true,
      data: { user: safeUser, token },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

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
