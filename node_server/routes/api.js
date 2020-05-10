const express = require('express');
const router = new express.Router();

router.get('/', (req, res, next) => {
  res.send('Please use an endpoint');
});

module.exports = router;
