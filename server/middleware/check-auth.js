const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.jwt
    console.log('INSIDE CHECK AUTH', token)
    const decoded = jwt.verify(token, process.env.JWT_KEY)
    req.userData = decoded
    next()
  } catch (error) {
    res.clearCookie('token')
    return res.redirect('/')
  }
}
