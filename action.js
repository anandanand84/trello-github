/**
 * Created by AAravindan on 10/3/16.
 */
var trello = require('./trello.js');
var util   = require('./Util.js');
var logger = require('./logger')(module);
var co     = require('co');

let API ;
module.exports = API = {
    processCommits : co.wrap(function* (message) {
        try {
            logger.info('Testing commits');
            var commited = message.ref && (message.deleted === false) && (message.commits.length > 0)
            if (commited) {
                logger.info('Processing commits');
                logger.info('----------------------------------------')
                var committer = message.pusher.name;
                var repository = message.repository.full_name;
                var branch = message.ref.split('refs/heads/')[1];
                var isPullRequest = (message.head_commit.committer.username === 'web-flow');
                var commitUrl = message.head_commit.url;
                var commitMessage = message.head_commit.message;
                var comment = "";
                if (isPullRequest) {
                    comment = committer + " Authored \n" + commitUrl + " \n" + " "+ commitMessage ;
                } else {
                    let filesChanged = 0;
                    message.commits.filter(function(commit) {
                        return commit.distinct;
                    }).forEach(function(commit) {
                        comment = comment + committer + " authored ";
                        comment = comment + " "  + commit.url + "\n\n";
                        comment = comment + "--- \n";
                        comment = comment + commit.message + "\n \n \n --- \n";
                        filesChanged = filesChanged + commit.added.length + commit.modified.length + commit.removed.length;
                    });
                    //comment = comment + "--- \n";
                    comment = comment + "\n No of files changed : "+filesChanged;
                };
                var issueNumbers = Array.from(new Set(util.findGithubIssueNumber(branch)
                    .concat(util.findGithubIssueNumber(commitMessage))));
                var cardNumbers = Array.from(new Set(util.findTrelloCardNumbers(branch)
                    .concat(util.findTrelloCardNumbers(commitMessage))));
                logger.info('----------------------------------------');
                logger.info('Commit Message ' + commitMessage);
                logger.info('Committer      ' + committer);
                logger.info('repository     ' + repository);
                logger.info('branch         ' + branch);
                logger.info('isPullRequest  ' + isPullRequest);
                logger.info('issueNumbers   ' + issueNumbers);
                logger.info('cardNumbers    ' + cardNumbers);
                logger.info('----------------------------------------');

                var trelloBoard = yield trello(); //or trello('withboardid', key, token);//not yet implemented
                var issueNumberPromise = trelloBoard.commentCardWithIssueNumbers(issueNumbers, comment, committer);
                var cardNumberPromise = trelloBoard.commentCardWithCardNumbers(cardNumbers, comment, committer);
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

                logger.info('----------------------------------------');
                logger.info('repository     ' + repository);
                logger.info('branch         ' + branch);
                logger.info('issueNumbers   ' + issueNumbers);
                logger.info('cardNumbers    ' + cardNumbers);
                logger.info('----------------------------------------');

                var trelloBoard = yield trello(); //or trello('withboardid', key, token);//not yet implemented
                var issueNumberPromise = trelloBoard.commentCardWithIssueNumbers(issueNumbers, comment, pusher);
                var cardNumberPromise = trelloBoard.commentCardWithCardNumbers(cardNumbers, comment, pusher);
                return yield [issueNumberPromise, cardNumberPromise]
            }
        } catch (e) {
            logger.error(e)
        }
    }),

    processPullRequestOpen : co.wrap(function* (message) {
        try {
            logger.info('Testing for pull request open');
            var isPullRequest = message.action === 'opened' && message.number && message.pull_request;
            if(isPullRequest) {
                var pullRequestTitle = message.pull_request.title + " " + message.pull_request.head.ref;
                var issueNumbers = Array.from(new Set(util.findGithubIssueNumber(pullRequestTitle)));
                var cardNumbers = Array.from(new Set(util.findTrelloCardNumbers(pullRequestTitle)));
                var user = message.pull_request.user.login;
                var comment = user + " Created a pull request " + message.pull_request.html_url + " \n --- \n" + " \n"+ message.pull_request.body;
                logger.info('----------------------------------------');
                logger.info('pullRequestTitle     ' + pullRequestTitle);
                logger.info('comment         ' + comment);
                logger.info('issueNumbers   ' + issueNumbers);
                logger.info('cardNumbers    ' + cardNumbers);
                logger.info('----------------------------------------');

                var trelloBoard = yield trello(); //or trello('withboardid', key, token);//not yet implemented
                var issueNumberPromise = trelloBoard.commentCardWithIssueNumbers(issueNumbers, comment, user);
                var cardNumberPromise = trelloBoard.commentCardWithCardNumbers(cardNumbers, comment, user);
                return yield [issueNumberPromise, cardNumberPromise]
            }
        }catch(e) {
            logger.info(e);
        }
    })
}

//if( require.main === module) {
// API.processPullRequestOpen(require('./messages/pullrequest_open.json'));
//}