import bcrypt from 'bcryptjs'
import prisma from '../config/prisma.js';
import { generateToken } from '../utils/generateToken.js'

export const signUp = async (req, res) => {
  const { name, email, password, gender, birthDate, phone, role } = req.body;
  const image = req.file?.filename;

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'USER',
    };

    if (image) userData.image = image;
    if (gender) userData.gender = gender;
    if (phone) userData.phone = phone;
    if (birthDate && !isNaN(new Date(birthDate).getTime())) {
      userData.birthDate = new Date(birthDate);
    }

    const user = await prisma.user.create({
      data: userData,
    });

    console.log(`🔐 New user signed up`);

    generateToken(user, res)

    res.status(201).json({
      message: 'User registered successfully',
    });

  } catch (err) {
    console.error('❌ Sign-up error:', err);
    res.status(500).json({ message: err.message })
  }
}

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`⚠️ Failed login attempt (user not found): ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log(`⚠️ Failed login attempt (wrong password): ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`✅ User logged in: ${email}`);

    generateToken(user, res);
    res.status(200).json({ message: 'Logged in', user: { id: user.id, email: user.email, role: user.role } });

  } catch (err) {
    console.error('❌ Sign-in error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const signOut = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  console.log('🚪 User logged out');
  res.status(200).json({ message: 'Logged out' });
};