const Discord = require('discord.js');
const {DiscordQuotesModule} = require('./modules/DiscordQuotesModule');
const ApiFetcher = require('../api/apiFetcher.js');

const prefix = '!';
const testChannel = '745285346849456141';
const version = process.env.VERSION;

/**
 * An IRC bot operating on the Discord platform. This bot can operate on the same (or different) database as any of the
 * bots. The bot expects some form of structure to the database - the same structure as is defined in the database
 * initialization script. Avoid changing what database is used by this bot unless it is completely necessary, and you
 * know what you are doing.
 */
class DiscordBot {
    /**
     * Constructs a new bot operating on Discord
     * @param {*} db the bot's database
     */
    constructor(db) {
        this.db = db;
        const client = new Discord.Client({intents: 32767});
        this.apiFetcher = new ApiFetcher();
        
        this.testMode = process.env.testing === 'true';
        
        client.once('ready', () => {
            console.log('Ready!');
            if (this.testMode) {
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `Test Mode (v${version})`,
                    },
                });
            } else {
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `Quotebot ready for duty`,
                    },
                });
            }
        });
        
        client.login(process.env.DISCORD_TOKEN);
        this.handleMessage = this.handleMessage.bind(this);
        this.quotesModule = new DiscordQuotesModule();
        
        client.on('message', this.handleMessage);
    }
    
    /**
     * Handles an incoming message
     * @param {*} message The message to handle. Contains all the necessary information for proper handling (comes
     * directly from Discord)
     */
    async handleMessage(message) {
        if (!message.content.startsWith(prefix) || message.author.bot) return;
        if (this.testMode) {
            if (message.channel.id !== testChannel) {
                console.log('testing is enabled, ignoring normal usage');
                return;
            }
        }
        const args = message.content.slice(prefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();
        
        if (command === 'quote') {
            message.reply(
                {
                    content: " ",
                    embeds: [this.quotesModule.handleCommand(args, message.author.username, false)],
                    allowedMentions: { repliedUser: false }
                },
            );
        }
        if (command === 'ceejus') {
            const quoteResponse = await this.apiFetcher.handleMessage(args);
            message.reply(
                {
                    content: " ",
                    embeds: [new Discord.MessageEmbed()
                        .setColor('#8F112F')
                        .setAuthor('Ceejus Quotes')
                        .setTitle(`Quote #${quoteResponse.id}`)
                        .setDescription(quoteResponse.quote)
                        .addFields(
                            {name: 'Quoted on', value: quoteResponse.quotedOn, inline: true},
                            {name: 'Quote by', value: quoteResponse.quotedBy, inline: true}
                        )
                        .setFooter(quoteResponse.alias === 'unknown' ? '' : `Also known as: ${quoteResponse.alias}`)],
                    allowedMentions: { repliedUser: false }
                }
            );
        }
    }
}

module.exports.DiscordBot = DiscordBot;
