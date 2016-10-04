var request = require('request-promise');
var co      = require('co');
var config  = require('./config.json');
var key     = config.trelloKey;
var token   = config.trelloToken;
var boardId = config.trelloBoardId;
var baseUrl = 'https://api.trello.com/1';
var logger  = require('./logger')(module);

var addCommentToCard = co.wrap(function* (cardId, comment) {
    try {
        return yield request.post(baseUrl + '/cards/' + cardId + '/actions/comments?key=' + key + '&token=' + token, {
            json: true,
            body: {
                text: comment
            }
        });
    } catch (e) {
        logger.error(e);
        return Promise.resolve(false);
    }
    //return Promise.resolve(true);
});

var findCardWithIssue = function(cards, issueNumber) {
    var filteredCards = cards.filter(function(cardDetail) {
        var name = cardDetail.name;
        var cardIssueNumber = parseInt(name.substring(name.lastIndexOf("#")+1, name.length));
        if(cardIssueNumber == issueNumber) {
            return true;
        }
    });
    return filteredCards[0];
};

var findCardWithShortId = function(cards, cardNumber) {
    var filteredCards = cards.filter(function(cardDetail) {
        var idShort = cardDetail.idShort;
        if(idShort == cardNumber) {
            return true;
        }
    });
    return filteredCards[0];
};


module.exports = co.wrap(function* () {
    try {
        var boardCards = JSON.parse(yield request(baseUrl + '/boards/' + boardId + '/lists?cards=open&card_fields=name,idShort&fields=name&key=' + key + '&token=' + token));
        var allCardTypes = boardCards.map(function (board) {
            return {
                id: board.id,
                name: board.name
            }
        });
        var allCards = boardCards.reduce(function (first, second) {
            return first.concat(second.cards)
        }, []);


        var commentCardWithIssueNumbers = co.wrap(function* (issueNumbers, comment) {
            try {
                if (issueNumbers.length <= 0) return Promise.resolve(true);
                var cards = issueNumbers.map((issueNumber) => { return findCardWithIssue(allCards, issueNumber) });
                logger.info('--------------------------------------------------------------');
                logger.info('Found cards : ');
                logger.info(cards);
                logger.info('for issue numbers ');
                logger.info(issueNumbers);
                logger.info('--------------------------------------------------------------');
                return cards.map(function(card) {
                    if(card && card.id)
                        return addCommentToCard(card.id, comment);
                    else
                        return Promise.resolve(true);
                });
            } catch (e) {
                logger.error(e);
            }
        });

        var commentCardWithCardNumbers = co.wrap(function*(cardNumbers, comment) {
            try {
                if (cardNumbers.length <= 0) return Promise.resolve(true);
                var cards = cardNumbers.map((cardNumber) => {return findCardWithShortId(allCards, cardNumber) });
                logger.info('--------------------------------------------------------------');
                logger.info('Found cards : ');
                logger.info(cards)
                logger.info('for card numbers ')
                logger.info(cardNumbers);
                logger.info('--------------------' +
                    '------------------------------------------');
                return cards.map(function(card) {
                    if(card && card.id)
                        return addCommentToCard(card.id, comment);
                    else
                        return Promise.resolve(true);
                });
            } catch (e) {
                logger.error(e);
            }
        });

        return {
            findCardWithIssue: findCardWithIssue,
            addCommentToCard: addCommentToCard,
            commentCardWithIssueNumbers: commentCardWithIssueNumbers,
            commentCardWithCardNumbers: commentCardWithCardNumbers
        }
    } catch (e) {
        logger.error(e);
    }
});

