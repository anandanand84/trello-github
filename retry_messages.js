/**
 * Created by AAravindan on 10/24/16.
 */
var Actions   = require('./action');
var co        = require('co');
var prompt     = require('co-prompt');

co(function *() {
    while(true) {
        try{
            var fileName = yield prompt('FileName: ');
            var file     = require('./messages/'+fileName);
            console.log(file);
            Actions.processCommits(file);
            Actions.processDelete(file);
            Actions.processPullRequestOpen(file);
        }catch(err) {
            console.error(err);
        }
    }
})

