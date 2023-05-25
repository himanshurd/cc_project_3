const { Router } = require('express')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')

const router = Router()

const {ValidationError} = require('sequelize')
const {generateAuthToken, requireAuthentication} = require('../lib/auth')
const {userInfo, UserClientFields, getUserByID, validateUser} = require('../models/user')
const jwt = require('jsonwebtoken')

/*
 * Route to login a registered user
 */
router.post('/login', async (req, res) => {
  if (req.body && req.body.email && req.body.password) {
    try {
      const authenticated = await validateUser(req.body.email, req.body.password);
      if (authenticated) {
        const token = generateAuthToken(req.body.userId);
        res.status(200).send({ token: token, message: "Successfully logged in" });
      } else {
        res.status(401).send({ error: "Access denied. Invalid Username or Password." });
      }
    } catch (err) {
      res.status(500).send({ error: "server error. Please try again later." });
    }
  } else {
    res.status(400).send({ error: "request is not vallid. Please provide correct email and password." });
  }
});


/*
* Route to create a new user.
*/
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body, UserClientFields)
    res.status(201).send({ id: user.id })
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message })
    } else {
      throw e
    }
  }
})

/*
 * Route to fetch info about a specific user.
 */
router.get('/:userId', requireAuthentication, async function (req, res, next) {
  const userId = req.params.userId
  const user = await User.findByPk(userId)
  if (user) {
    res.status(200).json(user)
  } else {
    next()
  }
})

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', async function (req, res) {
  const userId = req.params.userId
  const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
  res.status(200).json({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', async function (req, res) {
  const userId = req.params.userId
  const userReviews = await Review.findAll({ where: { userId: userId }})
  res.status(200).json({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', async function (req, res) {
  const userId = req.params.userId
  const userPhotos = await Photo.findAll({ where: { userId: userId }})
  res.status(200).json({
    photos: userPhotos
  })
})


module.exports = router
