const _ = require('lodash');
const Discord = require('discord.js');
const { BotModule } = require('../../modules/BotModule');
const { QuotesCore } = require('../../modules/quotes/QuotesCore');
const author = ('Flohabot - Quotes')

class DiscordQuotesModule extends BotModule {
    constructor() {
        super(['quote']);
        
        this.permissionDeniedEmbed = new Discord.MessageEmbed()
            .setColor('#ff0000')
            .setAuthor(author)
            .setTitle('Permission Denied')
            .setDescription('Moderation actions are currently not available on Discord')
            .setFooter('Please try again in Twitch chat');
    }
    
    // eslint-disable-next-line class-methods-use-this
    handleCommand(commandParts, sender, mod) {
        const quoteCommand = commandParts[0];
        if (quoteCommand === 'add') {
            const quote = commandParts.slice(1).join(' ');
            const number = QuotesCore.getInstance().addQuote(quote, sender);
            return new Discord.MessageEmbed()
                .setColor('#a91438a8')
                .setAuthor(author)
                .setTitle(`Added quote #${number}`)
                .setDescription(quote);
        }
        if (quoteCommand === 'delete') {
            if (!mod) {
                return this.permissionDeniedEmbed;
            }
            const quoteNumber = parseInt(commandParts[1], 10);
            if (!QuotesCore.getInstance().deleteQuote(quoteNumber)) {
                return new Discord.MessageEmbed()
                    .setColor('#ff0000')
                    .setAuthor(author)
                    .setTitle(`Error: ${quoteNumber} is not a number`);
            }
            return new Discord.MessageEmbed()
                .setColor('#8f112f')
                .setAuthor(author)
                .setTitle(`#${quoteNumber} deleted`);
        }
        if (quoteCommand === 'edit') {
            if (!mod) {
                return this.permissionDeniedEmbed;
            }
            const quoteNumber = parseInt(commandParts[1], 10);
            if (Number.isNaN(quoteNumber)) {
                return new Discord.MessageEmbed()
                    .setColor('#ff0000')
                    .setAuthor(author)
                    .setTitle(`Error: ${quoteNumber} is not a number`);
            }
            const newQuote = commandParts.splice(2).join(' ');
            QuotesCore.getInstance().editQuote(quoteNumber, newQuote);
            return new Discord.MessageEmbed()
                .setColor('#8F112F')
                .setAuthor(author)
                .setTitle(`#${quoteNumber} edited`);
        }
        if (quoteCommand === 'alias') {
            if (!mod) {
                return this.permissionDeniedEmbed;
            }
            const result = QuotesCore.getInstance().handleAliasRequest(commandParts, mod);
            return new Discord.MessageEmbed()
                .setColor('#8F112F')
                .setAuthor(author)
                .setTitle(result);
        }
        if (quoteCommand === 'info') {
            const quoteNumber = parseInt(commandParts[1], 10);
            const results = QuotesCore.getInstance().getQuoteInfo(quoteNumber);
            return new Discord.MessageEmbed()
                .setColor('#8F112F')
                .setAuthor(author)
                .setTitle(`Quote info for #${quoteNumber}`)
                .setDescription(results);
        }
        if (quoteCommand === 'search') {
            const searchString = commandParts.slice(1).join(' ');
            const results = QuotesCore.getInstance().searchQuote(searchString);
            //only one quote, return directly
            if (!results.includes(',') && results.includes('#')) {
                const quote = QuotesCore.getInstance().getQuote(parseInt(results.slice(1), 10));
                return new Discord.MessageEmbed()
                    .setColor('#8F112F')
                    .setAuthor(author)
                    .setTitle(`Quote #${quote.id}`)
                    .setDescription(quote.quote_text)
                    .addFields(
                        { name: 'Quoted on', value: quote.creation_date, inline: true },
                    )
                    .setFooter(`Also known as: ${quote.alias}`);
            }
            return new Discord.MessageEmbed()
                .setColor('#8F112F')
                .setAuthor(author)
                .setTitle(`Search results for '${searchString}'`)
                .setDescription(results);
        }
        if (quoteCommand === 'latest') {
            const quote = QuotesCore.getInstance().getLatestQuote();
            return new Discord.MessageEmbed()
                .setColor('#8F112F')
                .setAuthor(author)
                .setTitle(`Quote #${quote.id}`)
                .setDescription(quote.quote_text)
                .addFields(
                    { name: 'Quoted on', value: quote.creation_date, inline: true },
                )
                .setFooter(`Also known as: ${quote.alias}`);
        }
        // looking up a quote
        let quote;
        if (commandParts.length > 0) { // looking for a specific quote
            const lookup = commandParts[0];
            const quoteNumber = parseInt(lookup, 10);
            if (Number.isNaN(quoteNumber)) {
                const alias = commandParts.join(' ');
                quote = QuotesCore.getInstance().getQuoteAlias(alias);
                if (_.isNil(quote)) {
                    return new Discord.MessageEmbed()
                        .setColor('#8F112F')
                        .setAuthor(author)
                        .setTitle(`Quote with alias '${alias}' does not exist`);
                }
            } else {
                quote = QuotesCore.getInstance().getQuote(quoteNumber);
                if (_.isNil(quote)) {
                    return new Discord.MessageEmbed()
                        .setColor('#8F112F')
                        .setAuthor(author)
                        .setTitle(`Quote #${quoteNumber} does not exist`);
                }
            }
        } else {
            quote = QuotesCore.getInstance().getRandomQuote();
        }
        return new Discord.MessageEmbed()
            .setColor('#8F112F')
            .setAuthor(author)
            .setTitle(`Quote #${quote.id}`)
            .setDescription(quote.quote_text)
            .addFields(
                { name: 'Quoted on', value: quote.creation_date, inline: true },
            )
            .setFooter(quote.alias === 'NONE' ? '' : `Also known as: ${quote.alias}`);
    }
}

module.exports.DiscordQuotesModule = DiscordQuotesModule;
