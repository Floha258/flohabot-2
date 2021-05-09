const tmi = require('tmi.js');
const fs = require('fs');
const QuotesBot = require('../modules/quotes/QuotesBot');
const { isUserMod } = require('./TwitchHelper');

/**
 * IRC Chatbot run through Twitch. This serves as the main entry point into the Twitch modules of the bot, but most
 * functionality is broken out into those modules.
 */
class TwitchBot {
    /**
     * Constructs a new Twitch bot instance, using the environment variables to construct the instance
     * @param {*} db The database to use when looking up information for the bot (commands, quotes, etc.)
     */
    constructor(db) {
        this.db = db;
        this.quotesBot = new QuotesBot.QuotesBot(db);
        
        const opts = {
            identity: {
                username: process.env.BOT_USERNAME,
                password: process.env.OAUTH_TOKEN,
            },
            channels: process.env.CHANNEL_NAME.split(','),
        };
        
        // eslint-disable-next-line new-cap
        this.client = new tmi.client(opts);
        this.onMessageHandler = this.onMessageHandler.bind(this);
        this.client.on('message', this.onMessageHandler);
        this.client.on('connected', this.onConnectedHandler);
        
        this.client.connect();
    }
    
    /**
     * Handles an incoming chat messsage
     * @param {*} channel The channel the message was sent in
     * @param {*} user The user who sent the message
     * @param {*} message The message that was sent
     * @param {boolean} self true if the message was sent by the bot
     */
    onMessageHandler(channel, user, message, self) {
        if (self) {
            return;
        }
        
        // TODO: TIMED MESSAGE HANDLING
        
        let commandName = message.trim();
        
        if (!commandName.startsWith('!')) {
            // not a command
            // TODO: MODERATION?
            return;
        }
        
        const commandParts = message.substring(1).split(' ');
        commandName = commandParts[0].toLowerCase();
        
        if (commandName === 'addcmd') {
            if (!isUserMod(user, channel)) return;
            const newCommand = commandParts[1].toLowerCase();
            const output = commandParts.slice(2).join(' ');
            this.db.prepare('insert into `commands` (`name`, `response`) values (?, ?)').run(newCommand, output);
            this.client.say(
                channel,
                `@${user.username} command !${newCommand} successfully created`,
            );
        } else if (commandName === 'setcmd') {
            if (!isUserMod(user, channel)) return;
            const editCommand = commandParts[1].toLowerCase();
            const output = commandParts.slice(2).join(' ');
            this.db.prepare('update `commands` set `response`=? where `name`=?').run(output, editCommand);
            this.client.say(
                channel,
                `@${user.username} command !${editCommand} editted successfully`,
            );
        } else if (commandName === 'delcmd') {
            if (!isUserMod(user, channel)) return;
            const deleteCommand = commandParts[1].toLowerCase();
            this.db.prepare('delete from commands where `name`=?').run(deleteCommand);
            this.client.say(
                channel,
                `@${user.username} command !${deleteCommand} deleted sucessfully`,
            );
        } else if (commandName === 'quote') {
            // pass the message on to the quotes bot to handle
            // we remove the !quote because the bot assumes that the message has already been parsed
            const mod = isUserMod(user, channel);
            const quoteResponse = this.quotesBot.handleMessage(commandParts.slice(1), user.username, mod);
            if (quoteResponse === '') {
                return;
            }
            this.client.say(
                channel,
                `@${user.username} ${quoteResponse}`,
            );
        } else {
            // standard text commands
            const output = this.db.prepare('select `response` from `commands` where `name`=?').get(commandName);
            if (output === undefined) return; // invalid command
            this.client.say(channel, output.response);
        }
    }
    
    /**
     * Callback for a successful connection to the irc server
     * @param {*} addr The address of the irc server the bot connected to
     * @param {*} port The port on the server we are connected through
     */
    // eslint-disable-next-line class-methods-use-this
    onConnectedHandler(addr, port) {
        console.log(`* Connected to ${addr}:${port}`);
    }
    
    setupDb() {
        const commands = this.db.prepare('select * from commands');
    }
}

module.exports.TwitchBot = TwitchBot;