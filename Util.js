/**
 * Created by AAravindan on 10/3/16.
 */
const cardNumberRegex = /\bc\d+\b/gi;
const issueNumberRegex = /#\d+\b/gi;

var findMatch = function(regex, str) {
    let m;
    let results = [];
    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        m.forEach((match, groupIndex) => {
            results.push(match.toUpperCase());
        });
    }
    return results;
};

let API;

module.exports = API = {
    findTrelloCardNumbers : function(str) {
        return findMatch(cardNumberRegex, str).map((match) => match.replace('C',''));
    },

    findGithubIssueNumber : function(str) {
        return findMatch(issueNumberRegex, str).map((match) => match.replace('#',''));
    }
}

//console.log(API.findTrelloCardNumbers('c935 - test C930 - this is my c932 commit'));
