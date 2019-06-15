const axios = require('axios');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secrets = require('./secrets.js')
const db = require('../database/dbConfig.js')
const Users = require('./helpers.js')

const { authenticate } = require('../auth/authenticate');

generateToken = (user) => {
  return jwt.sign({
      userId: user.id,
  }, secrets.jwt, {
      expiresIn: '1h'
  })
}

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {

  let user = req.body

  const hash = bcrypt.hashSync(user.password, 10)
  user.password = hash
  
  Users.add(user)
    .then(saved => {
      const token = generateToken(saved)

      res.status(200).json({
        message: `Welcome ${user.username}`,
        token: token
      })
    })
    .catch(err => {
      res.status(500).json(err)
      console.log(user)
    })
  // implement user registration
}

function login(req, res) {
  // implement user login
  let {username, password} = req.body

  Users.findBy({username})
  .first()
  .then(user => {
    if(user && bcrypt.compareSync(password, user.password)) {
      const token = generateToken(user)

      res.status(200).json({
        message: `Welcome ${user.username}`,
        token: token
      })
    } else {
      res.status(500).json(err)
    }
  })
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
