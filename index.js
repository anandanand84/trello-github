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

app.use(require('koa-static')('app'));

var router = new Router();

router.post('/',koaBody, function *() {
    this.response.body = this.request.body;
    var body = this.request.body;
    var location = path.join(__dirname, '/messages/') + Date.now() + '.json';
    fs.writeFileSync(location, JSON.stringify(body, null, 4));
    Actions.processCommits(body);
    Actions.processDelete(body);
    return true;
});

app.use(router.routes())
    .use(router.allowedMethods());

app.listen(env.PORT || 15999, env.IP || '0.0.0.0', function() {
    logger.info('Listening for github request on ' + (env.PORT || 15999));
});
