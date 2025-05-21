import jwt from 'jsonwebtoken'

export const generateToken = (user, res) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  )

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 3 * 24 * 60 * 60 * 1000,
    sameSite: 'strict',
    secure: true
  })
}