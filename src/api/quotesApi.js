const express = require('express');

const quotes = express.Router();

let quotesCore = null;

quotes.use((req, res, next) => {
    if (quotesCore === null) {
        quotesCore = req.app.get('quotesCore');
    }
    next();
});

quotes.get('/quote', async (req, res) => {
    const { quoteNumber, alias, search } = req.query;
    let quote;
    if (quoteNumber) {
        quote = quotesCore.getQuote(quoteNumber);
    } else if (alias) {
        quote = quotesCore.getQuoteAlias(alias);
    } else if (search) {
        let result = quotesCore.searchQuote(search);
        if (!result.includes(',') && result.includes('#')) {
            quote = quotesCore.getQuote(parseInt(result.slice(1), 10));
        } else {
            quote = {results: result};
        }
    } else {
        quote = quotesCore.getRandomQuote();
    }
    res.send(quote);
});

module.exports = quotes;
