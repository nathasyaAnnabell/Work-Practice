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

    const user = await prisma.user.create({
      data: {
        image,
        name,
        email,
        password: hashedPassword,
        gender,
        birthDate: new Date(birthDate),
        phone,
        role: role || 'USER',
      },
    });

    generateToken(user, res)

    res.status(201).json({
      message: 'User registered successfully',
    });

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
}

export const signIn = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })

    generateToken(user, res)
    res.status(200).json({ message: 'Logged in', user: { id: user.id, email: user.email, role: user.role } })

  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const signOut = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) })
  res.status(200).json({ message: 'Logged out' })
}