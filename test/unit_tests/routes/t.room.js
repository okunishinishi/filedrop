var should = require('should'),
    room = require('../../../routes/r.room.js');

exports.indexTest = function (test) {
    room.index(null, {
        render: function (view) {
            view.should.equal('room/index.jade');
            test.done();
        }
    });
};