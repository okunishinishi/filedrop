var tek = require('tek'),
    file = tek.file,
    uuid = tek.uuid,
    copy = file.copy,
    mkdirP = file.mkdirP,
    JobQueue = tek['JobQueue'],
    path = require('path'),
    resolve = path.resolve,
    fs = require('fs'),
    extname = path.extname,
    config = require('../app.config');


function handleErr(err) {
    console.error(err);
}

/**
 * save multiple files with unique name
 * @param save_dirpath
 * @param files
 * @param callback
 */
function saveFiles(save_dirpath, files, callback) {
    var file = files.shift();
    if (file) {
        mkdirP(save_dirpath, function () {
            var save_sub_dirpath = resolve(save_dirpath, String(new Date().getTime()));
            mkdirP(save_sub_dirpath, function () {
                var save_path = resolve(save_sub_dirpath, file.name);
                copy(file.path, save_path, function (err) {
                    err && handleErr(err);
                    saveFiles(save_dirpath, files, function (result) {
                        result.unshift(save_path);
                        callback(result);
                    });
                });
            });
        });
    } else {
        callback([]);
    }
}

exports.room_file = function (req, res) {
    var l = res.locals.l;
    var queue = new JobQueue;
    var result = {};
    var room_id = req.params['room_id'];
    Object.keys(req.files).forEach(function (name) {
        var saveDir = resolve(config.uploadDir, name, room_id),
            files = [].concat(req.files[name]);
        queue.push(function (next) {
            saveFiles(saveDir, files, function (saved) {
                result[name] = saved;
                next();
            });
        });
    });
    queue.execute(function () {
        req.flash('info_alert', l.msg.upload_done);
        res.send(JSON.stringify(result));
    });
};