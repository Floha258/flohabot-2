const fetch = require('node-fetch');
const url = 'https://ceejus.deepwelldevelopment.com/api/quotes/quote';

class ApiFetcher {
    
    initialize() {
        ApiFetcher.INSTANCE = this;
    }
    
    async handleMessage(args) {
        try {
            let quote;
            if (args.length > 0) {
                const quoteNumber = parseInt(args[0], 10);
                if (Number.isNaN(quoteNumber)) {
                    const response =
                        await fetch(`${url}?alias=${args.join(' ')}`);
                    if (!response.ok) {
                        return this.errorResponse(response);
                    } else {
                        quote = await response.json();
                    }
                } else {
                    const response =
                        await fetch(`${url}?quoteNumber=${quoteNumber}`);
                    if (!response.ok) {
                        return this.errorResponse(response);
                    } else {
                        quote = await response.json();
                    }
                }
            } else {
                const response =
                    await fetch(url);
                if (!response.ok) {
                    return this.errorResponse(response);
                } else {
                    quote = await response.json();
                }
            }
            return quote;
        } catch (error) {
            console.error(error);
            return this.errorResponse({status: 'No Response'});
        }
        
    }
    
    errorResponse(response) {
        return {
            id: 0,
            quote: 'An Error occured, please try again later! Error ' + response.status + ' #blameCJ',
            quotedOn: 'ERROR',
            creation_date: '01/01/2000',
            quotedBy: 'none'
        };
    }
}

module.exports = ApiFetcher;
