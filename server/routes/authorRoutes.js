const { Router } = require('express')
const authorController = require('../controllers/authorController')
const orcidController = require('../controllers/orcidController')
const routes = Router({ mergeParams: true }) // Merge to access parent params i.e. :addr
const checkAuth = require('../middleware/check-auth')

// /authors/
routes.get('/:address', checkAuth, authorController.getAuthor)
routes.post('/:address', checkAuth, authorController.addAuthor)
routes.put('/:address', checkAuth, authorController.updateAuthor)
routes.post('/orcid/oauth/token', checkAuth, orcidController.requestAccessToken)
routes.get('/orcid/:orcid/:endpoint', checkAuth, orcidController.requestRecord)
routes.get('/', checkAuth, authorController.getAllAuthorNames)
module.exports = routes
