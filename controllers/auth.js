import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/Users.js";

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;

    //check if username exists then create if it doesnt 
    const existingUser = await User.findOne({email})
    if (existingUser) {
      return res.status(400).json({
        error: 'username must be unique'
      })
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: passwordHash,
    });

    const savedUser = await newUser.save();

    const userForToken = {
      email: email,
    }
    const token = jwt.sign(userForToken, process.env.JWT_SECRET);

    delete savedUser.password;
    res.status(200).json({ token, savedUser });

  } catch (err) {
    console.log(err.message)
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    const userForToken = {
      email: user.email,
    }
    const token = jwt.sign(userForToken, process.env.JWT_SECRET);

    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};