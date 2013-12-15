var tek = require('tek'),
    copy = tek.meta.copy,
    db = require('../db'),
    config = require('../app.config'),
    path = require('path'),
    resolve = path.resolve,
    relative = path.relative,
    fs = require('fs'),
    v = require('./validations'),
    JobQueue = tek['JobQueue'],
    Room = db.models['Room'];

var search_fields = ['name'];

exports.index = function (req, res) {
    res.render("room.jade", {

    });
};

function readRoomFiles(room_id, callback) {
    var result = [];
    var room_file_dirpath = resolve(config.uploadDir, 'room_file', room_id);
    fs.exists(room_file_dirpath, function (exists) {
        if (!exists) {
            callback && callback(null, result);
            return;
        }
        fs.readdir(room_file_dirpath, function (err, date_strings) {
            if (err) {
                callback && callback(err);
                return;
            }
            var queue = new JobQueue;
            date_strings.forEach(function (date_string) {
                queue.push(function (next) {
                    var date_dirpath = resolve(room_file_dirpath, date_string);
                    fs.readdir(date_dirpath, function (err, filenames) {
                        if (err) {
                            callback && callback(err);
                            callback = null;
                            return;
                        }
                        filenames.forEach(function (filename) {
                            var filepath = resolve(date_dirpath, filename),
                                url = '/' + relative(config.publicDir, filepath);
                            result.push({
                                href: url,
                                name: path.basename(url)
                            });
                        });
                        next();
                    });
                });
            });
            queue.execute(function () {
                callback(null, result);
            });
        });
    });
}
exports.api = {
    save: function (req, res) {
        var l = res.locals.l,
            data = req.body || {},
            _id = data._id;
        if (_id) {
            new v.room.RoomUpdateSchema().validate(data, function (err) {
                if (err) {
                    res.json({err: err});
                    return;
                }
                Room.findById(_id, function (old) {
                    var room = new Room(data),
                        diff = room.diff(old);
                    var schema = new v.room.RoomUpdateSchema.Newer;
                    schema.validate(diff.newer(), function (err) {
                        if (err) {
                            res.json({err: err});
                            return;
                        }
                        copy.fallback(old, room);
                        room.update(function (room) {
                            res.json({
                                room: room
                            });
                        });
                    });
                });
            });
        } else {
            new v.room.RoomInsertSchema().validate(data, function (err) {
                if (err) {
                    res.json({err: err});
                    return;
                }
                var room = new Room(data);
                room.save(function (room) {
                    res.json({
                        room: room
                    });
                });
            });
        }
    },
    destroy: function (req, res) {
        var data = req.body;
        new v.room.RoomDestroySchema().validate(data, function (err) {
            if (err) {
                res.json({err: err});
                return;
            }
            Room.findById(data._id, function (room) {
                if (room) {
                    room.remove(function () {
                        res.json({count: 1});
                    });
                } else {
                    res.json({count: 0});
                }
            });
        });
    },
    one: function (req, res) {
        var p = req.params,
            _id = p && p._id;

        function fail(err) {
            console.error(err);
            if (fail.aborted) return;
            fail.aborted = true;
            res.redirect('/503');
        }

        Room.findById(_id, function (room) {
            if (!room) {
                res.redirect && res.redirect('/404');
                return;
            }
            readRoomFiles(_id, function (err, files) {
                if (err) {
                    fail(err);
                    return;
                }
                room.files = files;
                res.json(room);
            });
        });
    },
    list: function (req, res) {
        var q = req.query || {},
            search_word = q.search_word,
            limit = Number(q.limit || 500),
            skip = Number(q.skip || 0),
            condition = {};
        if (search_word) {
            search_fields.forEach(function (field) {
                condition[field] = search_word;
            });
            condition = new db.AmbiguousCondition(condition);
        }
        Room.findByCondition(condition,function (models) {
            res.json(models);
        }).limit(limit).skip(skip);
    }
};