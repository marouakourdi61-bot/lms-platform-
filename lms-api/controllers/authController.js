const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../services/email/emailService");

const SALT_ROUNDS = 10;

const register = async (req, res, next) => {
  //  console.log("registred");
  try {
    
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error("Email already registered");
      error.statusCode = 409;
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "learner",
    });

    try {
      

      await sendEmail({
        to: user.email,
        subject: "Bienvenue sur notre LMS",
        template: "welcome",
        data: { name: user.name },
        event: "user_registered",
      });

      
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'e-mail :", emailError.message);
    }


    return res.status(201).json({
      status: 201,
      message: "Account created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email }).select("+password");
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error);
    }
    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error);
    }
    if (user.status !== "active") {
      const error = new Error("Account is suspended");
      error.statusCode = 403;
      return next(error);
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("jwt secret is not configured");
    }

    const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
      subject: user._id.toString(),
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      status: 200,
      message: "login successful",
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }
    return res.status(200).json({
      status: 200,
      message: "profile retrieved success",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
