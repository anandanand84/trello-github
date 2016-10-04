/**
 * Created by AAravindan on 10/3/16.
 */
var trello = require('./trello.js');
var util   = require('./Util.js');
var logger = require('./logger')(module);
var co     = require('co');

module.exports = {
    processCommits : co.wrap(function* (message) {
        try {
            logger.info('Testing commits');
            var commited = message.ref && (message.created === false && message.deleted === false) && (message.commits.length > 0)
            if (commited) {
                logger.info('Processing commits');
                logger.info('----------------------------------------')
                var commitMessage = message.head_commit.message;
                var committer = message.pusher.name;
                var repository = message.repository.full_name;
                var branch = message.ref.split('refs/heads/')[1];
                var isPullRequest = (message.head_commit.committer.username === 'web-flow');
                var commitUrl = message.head_commit.url;
                var issueNumbers = Array.from(new Set(util.findGithubIssueNumber(branch)
                    .concat(util.findGithubIssueNumber(commitMessage))));
                var cardNumbers = Array.from(new Set(util.findTrelloCardNumbers(branch)
                    .concat(util.findTrelloCardNumbers(commitMessage))));
                var comment;
                if (isPullRequest) {
                    comment = committer + " Authored " + commitUrl;
                } else {
                    comment = committer + " Authored " + commitUrl;
                }
                logger.info('----------------------------------------')
                logger.info('Commit Message ' + commitMessage);
                logger.info('Committer      ' + committer);
                logger.info('repository     ' + repository);
                logger.info('branch         ' + branch);
                logger.info('isPullRequest  ' + isPullRequest);
                logger.info('issueNumbers   ' + issueNumbers);
                logger.info('cardNumbers    ' + cardNumbers);
                logger.info('----------------------------------------')

                var trelloBoard = yield trello(); //or trello('withboardid', key, token);//not yet implemented
                var issueNumberPromise = trelloBoard.commentCardWithIssueNumbers(issueNumbers, comment);
                var cardNumberPromise = trelloBoard.commentCardWithCardNumbers(cardNumbers, comment);
                return yield [issueNumberPromise, cardNumberPromise]
            }
        } catch (e) {
            logger.error(e);
        }
    }),

    processDelete : co.wrap(function* (message) {
        try {
            logger.info('Testing delete');
            var deletedBranch = message.ref && message.deleted && (message.head_commit === null);
            if (deletedBranch) {
                logger.info('processing branch delete');
                var repository = message.repository.full_name;
                var branch = message.ref.split('refs/heads/')[1];
                var pusher = message.pusher.name;

                var issueNumbers = Array.from(new Set(util.findGithubIssueNumber(branch)));
                var cardNumbers = Array.from(new Set(util.findTrelloCardNumbers(branch)));
                var comment = pusher + " Deleted branch " + repository + " " + branch

                logger.info('----------------------------------------')
                logger.info('repository     ' + repository);
                logger.info('branch         ' + branch);
                logger.info('issueNumbers   ' + issueNumbers);
                logger.info('cardNumbers    ' + cardNumbers);
                logger.info('----------------------------------------')

                var trelloBoard = yield trello(); //or trello('withboardid', key, token);//not yet implemented
                var issueNumberPromise = trelloBoard.commentCardWithIssueNumbers(issueNumbers, comment);
                var cardNumberPromise = trelloBoard.commentCardWithCardNumbers(cardNumbers, comment);
                return yield [issueNumberPromise, cardNumberPromise]
            }
        } catch (e) {
            logger.error(e)
        }
    })
}