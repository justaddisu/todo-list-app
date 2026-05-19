import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin || false,
  role: user.role || "user",
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email and password are required");
    }

    const exists = await User.findOne({ where: { email: email.toLowerCase() } });
    if (exists) {
      res.status(409);
      throw new Error("Email already in use");
    }

    const user = await User.create({ name, email: email.toLowerCase(), password });
    const token = generateToken(user.id);

    return res.status(201).json({ user: sanitizeUser(user), token });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const token = generateToken(user.id);
    return res.status(200).json({ user: sanitizeUser(user), token });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const { name, email, password, currentPassword } = req.body;

    // If changing password, require current password verification
    if (password) {
      if (!currentPassword) {
        res.status(400);
        throw new Error("Current password is required to set a new password");
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(401);
        throw new Error("Current password is incorrect");
      }
    }

    if (email && email.toLowerCase() !== user.email) {
      const conflict = await User.findOne({ where: { email: email.toLowerCase() } });
      if (conflict) {
        res.status(409);
        throw new Error("Email already in use");
      }
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.toLowerCase();
    if (password) user.password = password; // hook re-hashes

    await user.save();
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
};
