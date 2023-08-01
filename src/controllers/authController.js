const User = require('../models/User');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');

//SET up CUSTOM ERRORs later

// create token
const createJWT = (user) => {
  const payload = {
    name: user.name,
    userId: user._id,
    role: user.role,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });

  if (emailAlreadyExists) {
    res.status(400).json({ msg: 'This email already exists in a database' });
  }

  //first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0; //get all users, and if there are no users assign role to admin
  const role = isFirstAccount ? 'admin' : 'user';

  const hashedPassword = await argon2.hash(password);

  //create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  //create token for the user
  const createJWT = (user) => {
    return { name: user.name, userId: user._id, role: user.role };
  };

  const tokenUser = createJWT(user);

  res.status(200).json({ user: tokenUser }); //sends as response 'tokenUser' with 3 properties { name: user.name, userId: user._id, role: user.role }; and calls it 'user' object
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if a user with the specified email exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify the entered password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // If validation passes, create the JWT token
    const token = createJWT(user);

    // Set the cookie with the token
    const oneYearInSeconds = 31536000; // 1 year in seconds
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: oneYearInSeconds * 1000, // Convert seconds to milliseconds
    });

    // Remove the hashed password from the user object before sending it in the response
    user.password = undefined;

    // Send the response with user data and the cookie
    return res.status(200).json({ user });
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  register,
  login,
};
