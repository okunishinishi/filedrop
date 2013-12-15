/**
 * validation for user room
 */
v.room = (function (v) {
    var Schema = v.Schema;
    return {
        insert: new Schema({

        }),
        update: new Schema({
            _id: {
                required: true
            },
            name:{
                required:true
            },
            retention:{
                required:true
            }
        }),
        destroy: new Schema({
            _id: {
                required: true
            }
        })
    }
})(v);