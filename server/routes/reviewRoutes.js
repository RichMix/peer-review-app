const { Router } = require('express')
const reviewController = require('../controllers/reviewController')
const checkAuth = require('../middleware/check-auth')

const routes = Router({ mergeParams: true }) // Merge to access parent params i.e. /reviews/:addr/:id

routes.get('/import/:source/', checkAuth, reviewController.importReviews)
routes.get('/xml/:source', checkAuth, reviewController.getReviewXML) // e.g. /xml/f1000research/?doi=10.12688/f1000research.19542.1
routes.get('/all', checkAuth, reviewController.getIndexedReviews)
routes.get('/:address/:id', checkAuth, reviewController.getReview)
routes.get('/:address', checkAuth, reviewController.getAllReviewsOfAddress)
routes.post('/:address', checkAuth, reviewController.addReview)
module.exports = routes
