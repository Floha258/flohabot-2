const Database = require('better-sqlite3');
const fs = require('fs');
const { DiscordBot } = require('./src/discord/DiscordBot');
const TwitchBot = require('./src/twitch/TwitchBot');
const { QuotesCore } = require('./src/modules/quotes/QuotesCore');
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        // expose the raw body of the request for signature verification
        req.rawBody = buf;
    },
}));
const api = require('./src/api/api.js');
const port = 3258;

let db;
if (process.env.testing === 'true') {
    db = new Database('bot_test.db', { verbose: console.log });
} else {
    db = new Database('bot.db');
}

// set up the database
// the setup script will run everytime the bot starts.
// Take care that it will not overwrite data and will always work or the bot may not start
const setupScript = fs.readFileSync('src/dbsetup.sql', 'utf-8');
db.exec(setupScript);

const quotesCore = new QuotesCore();
quotesCore.initialize(db);
app.set('quotesCore', quotesCore);

app.use('/api', api);

app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});

const twitchBot = new TwitchBot.TwitchBot(db);
const discordBot = new DiscordBot(db);

// Ensure that the database connection is closed when the process terminates
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));
