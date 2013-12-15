var tek = require('tek'),
    copy = tek.meta.copy,
    db = require('../db'),
    v = require('./validations'),
    Room = db.models['Room'];

var search_fields = ['name'];

exports.index = function (req, res) {
    res.render("room.jade", {

    });
};
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
        Room.findById(_id, function (room) {
            res.json(room);
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