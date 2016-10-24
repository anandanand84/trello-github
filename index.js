/**
 * Created by AAravindan on 6/30/16.
 */
"use strict";
const koa     = require('koa');
var app       = koa();
var co        = require('co');
var Router    = require('koa-router');
var koaBody   = require('koa-body')();
var path      = require('path');
var request   = require('request-promise');
var fs        = require('fs');
var env       = process.env;
var logger    = require('./logger')(module);
var Actions   = require('./action');
var fs        = require('fs');
var path      = require('path');
const querystring = require('querystring');
var config    = require('./config.json');

var router = new Router();

router.post('/',koaBody, function *() {
    this.response.body = this.request.body;
    var body = this.request.body;
    var location = path.join(__dirname, '/messages/') + Date.now() + '.json';
    fs.writeFileSync(location, JSON.stringify(body, null, 4));
    Actions.processCommits(body);
    Actions.processDelete(body);
    Actions.processPullRequestOpen(body);
    return true;
});

router.put('/associateUser',koaBody, function* () {
   var input = this.request.body;
   var config = require('./config.json');
   config[input.user] = input;
   fs.writeFileSync(__dirname + '/config.json', JSON.stringify(config, null, 4));
   this.response.body = { status : 'success'};
});

router.get('/githubUser', function * () {
    try{
        var code = this.request.url.split('code=')[1];
        var result = yield request.post('https://github.com/login/oauth/access_token?'+querystring.stringify({ client_id: config.client_id,client_secret:config.client_secret, code: code }));
        var accessToken = querystring.parse(result).access_token;
        var options = {
            url: 'https://api.github.com/user?access_token='+accessToken,
            headers: {
                'User-Agent': 'request'
            }
        };
        var user = yield request.get(options);
        //var redirecturl = 'http://localhost:15999/login-success.html?login='+JSON.parse(user).login
        console.log('sending response');
        this.response.body = { user : JSON.parse(user).login }
    }catch(err) {
        console.error(err);
    }
});

app.use(router.routes())
    .use(router.allowedMethods());

app.use(require('koa-static')('dist'));

app.listen(env.PORT || 15999, env.IP || '0.0.0.0', function() {
    logger.info('Listening for github request on ' + (env.PORT || 15999));
});
