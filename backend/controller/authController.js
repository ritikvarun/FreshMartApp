import User from "../model/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import { genToken, genToken1 } from "../config/token.js";
import { sendAdminNewUserAlert } from "../utils/mailer.js";
import { google } from "googleapis";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "None" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const adminCookieOptions = {
  ...cookieOptions,
  maxAge: 1 * 24 * 60 * 60 * 1000,
};

export const registration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exist" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Enter valid Email" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Enter Strong Password" });
    }
    let hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashPassword });
    let token = await genToken(user._id);
    res.cookie("token", token, cookieOptions);

    // Admin ko new user registration alert bhejna
    sendAdminNewUserAlert(user.name, user.email, "Standard");

    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    return res.status(201).json({ ...userObj, token });
  } catch (error) {
    console.log("registration error");
    return res.status(500).json({ message: `registration error ${error}` });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User is not Found" });
    }
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    let token = await genToken(user._id);
    res.cookie("token", token, cookieOptions);
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    return res.status(201).json({ ...userObj, token });
  } catch (error) {
    console.log("login error");
    return res.status(500).json({ message: `Login error ${error}` });
  }
};
export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "lax",
    });
    return res.status(200).json({ message: "logOut successful" });
  } catch (error) {
    console.log("logOut error");
    return res.status(500).json({ message: `LogOut error ${error}` });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { googleIdToken } = req.body;
    if (!googleIdToken || !process.env.GOOGLE_CLIENT_ID) {
      return res
        .status(400)
        .json({ message: "Verified Google token is required" });
    }

    const oauthClient = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID);
    const ticket = await oauthClient.verifyIdToken({
      idToken: googleIdToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const name = payload?.name;
    const email = payload?.email?.toLowerCase();
    if (!email || payload?.email_verified !== true) {
      return res.status(401).json({ message: "Google email is not verified" });
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
      });
      // Admin ko new Google signup alert bhejna
      sendAdminNewUserAlert(user.name, user.email, "Google");
    }

    let token = await genToken(user._id);
    res.cookie("token", token, cookieOptions);
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    return res.status(200).json({ ...userObj, token });
  } catch (error) {
    console.log("googleLogin error");
    return res.status(500).json({ message: `googleLogin error ${error}` });
  }
};

export const adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    const inputEmail = (email || "").trim().toLowerCase();
    const configEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const configPassword = process.env.ADMIN_PASSWORD || "";

    if (
      inputEmail &&
      configEmail &&
      inputEmail === configEmail &&
      password === configPassword
    ) {
      let token = await genToken1(configEmail);
      res.cookie("token", token, adminCookieOptions);
      return res.status(200).json({ token });
    }
    return res.status(400).json({ message: "Invalid credentials" });
  } catch (error) {
    console.log("AdminLogin error");
    return res.status(500).json({ message: `AdminLogin error ${error}` });
  }
};
