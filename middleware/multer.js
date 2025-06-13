import multer from 'multer'
import path from 'path'
import fs from 'fs'

const dir = 'uploads'
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname)
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, uniqueName)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (allowedTypes.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Only jpeg, png, jpg allowed!'), false)
}

const upload = multer({ storage, fileFilter })
export default upload