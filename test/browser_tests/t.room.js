var tek = require('tek'),
    define = tek['meta']['define'],
    driveway = require('./driveway'),
    new_rider = require('./new_rider'),
    should = require('should');

var room = driveway['room'],
    rider = new_rider();

exports.tearDown = function (done) {
    done()
};
exports.goIndexTest = function (test) {
    room.goIndex(rider, function () {
        test.done();
    });
};
exports.addModelTest = function (test) {
    room.addModel(rider, {
        name: 'hello_room'
    }, function () {
        test.done();
    });
};
exports.updateModelTest = function (test) {
    room.updateModel(rider, {
        name: 'next_room'
    }, function () {
        test.done();
    });
};
exports.searchModelTest = function (test) {
    room.searchModel(rider, "room", function (result) {
        should.exist(result);
        test.done();
    });
};
exports.removeModelTest = function (test) {
    room.removeModel(rider, function () {
        test.done();
    });
};