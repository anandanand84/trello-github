/**
 * Created by AAravindan on 6/30/16.
 */
"use strict";
const koa     = require('koa');
var app       = koa();
var Router    = require('koa-router');
var koaBody   = require('koa-body')();
var path      = require('path');
var request   = require('request-promise');
var fs        = require('fs');
var env       = process.env;
var logger    = require('./logger')(module);

app.use(require('koa-static')('app'));

var router = new Router();

router.post('/',koaBody, function *() {
    logger.info("---START OF REQUEST---");
    logger.info(this.request.url);
    logger.info(this.request.querystring);
    logger.info(JSON.stringify(this.request.body, 4));
    logger.info("---END OF REQUEST---");
    this.response.body = this.request.body;
});

app.use(router.routes())
    .use(router.allowedMethods());

app.listen(env.PORT || 15999, env.IP || '0.0.0.0', function() {
    logger.info('Listening for github request on ' + env.PORT || 15999);
});
