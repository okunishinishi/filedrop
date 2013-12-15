var tek = require('tek'),
    ServerSide = require('./serverside'),
    Err = ServerSide.Err,
    clientside = require('./clientside').room,
    models = require('../../db/models'),
    Room = models['Room'];



exports.RoomInsertSchema = ServerSide.extend(clientside.insert, {
});

exports.RoomUpdateSchema = ServerSide.extend(clientside.update, {
});

exports.RoomUpdateSchema.Newer = ServerSide.extend({}, {
    _vr: new ServerSide.UndefinedValidator({
        cause: 'update_conflict'
    })
});

exports.RoomDestroySchema = ServerSide.extend(clientside.destroy, {
});


