const { Router } = require('express')
const authorController = require('../controllers/authorController')
const orcidController = require('../controllers/orcidController')
const routes = Router({ mergeParams: true }) // Merge to access parent params i.e. :addr
const checkAuth = require('../middleware/check-auth')

// /authors/
routes.get('/:address', checkAuth, authorController.getAuthor)
routes.post('/:address', authorController.addAuthor)
routes.put('/:address', authorController.updateAuthor)
routes.post('/orcid/oauth/token', orcidController.requestAccessToken)
routes.get('/orcid/:orcid/:endpoint', orcidController.requestRecord)
routes.get('/', authorController.getAllAuthorNames)
module.exports = routes
