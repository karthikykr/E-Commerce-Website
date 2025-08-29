const User = require("../models/User");
const { generateToken } = require("../helpers/tokenHelper");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Admin credentials from .env
    // const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    // const adminPassword = process.env.ADMIN_PASSWORD;

    // Handle admin login
    // if (adminEmails.includes(email) && password === adminPassword) {
    //   const adminUser = {
    //     _id: email === adminEmails[0] ? 'admin-hardcoded-id' : 'admin-kaushik-id',
    //     name: email === adminEmails[0] ? 'Admin User' : 'Kaushik B Shetty',
    //     email,
    //     role: 'admin',
    //     authMethod: 'email',
    //     isActive: true,
    //     lastLogin: new Date()
    //   };

    //   const token = generateToken(adminUser._id, adminUser.role);

    //   return res.json({
    //     success: true,
    //     message: 'Admin login successful',
    //     data: { user: adminUser, token },
    //   });
    // }

    // Handle regular user login
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Update last login
    // user.lastLogin = new Date();
    // await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

//Register

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = req.body.role ? req.body.role : "user";
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email address",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    const user = await new User(userData).save();

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};
