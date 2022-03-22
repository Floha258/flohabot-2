const express = require('express');

const quotes = require('./quotesApi.js');

const router = express.Router();

router.use('/quotes', quotes);

module.exports = router;
