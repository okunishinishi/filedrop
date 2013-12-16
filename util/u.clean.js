var tek = require('tek'),
    path = require('path'),
    fs = require('fs'),
    resolve = path.resolve,
    config = require('../app.config'),
    JobQueue = tek['JobQueue'],
    db = require('../db');

function handleErr(err) {
    console.error(err);
}
function removeAllDir(dirpaths, callback) {
    var queue = new JobQueue;
    dirpaths.forEach(function (dirpath) {
        queue.push(function (next) {
            tek.file.rmdirRecursive(dirpath, function () {
                console.log('dir removed:', dirpath);
                next();
            });
        });
    });
    queue.execute(callback);
}
exports.cleanRoomFiles = function (callback) {
    var Room = db.models['Room'];
    Room.findAll(function (rooms) {
        var queue = new JobQueue;
        rooms.forEach(function (room) {
            queue.push(function (next) {
                var _id = room._id,
                    retention = Number(room.retention || 3) * 24 * 60 * 60 * 1000;
                var room_dir = resolve(config.uploadDir, 'room_file', String(_id));
                fs.exists(room_dir, function (exists) {
                    if (exists) {
                        fs.readdir(room_dir, function (err, date_dirnames) {
                            err && handleErr(err);
                            var dirs_to_remove = date_dirnames
                                .filter(function (date_dirname) {
                                    var date = new Date(Number(date_dirname)),
                                        passed = Number(new Date() - date);
                                    return retention < passed;
                                })
                                .map(function (dirname) {
                                    return resolve(room_dir, dirname);
                                });
                            removeAllDir(dirs_to_remove, function () {
                                next();
                            });
                        });
                    } else {
                        next();
                    }
                });
            });
        });
        queue.execute(function () {
            callback && callback();
        });
    });
};