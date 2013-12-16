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
            name: {
                required: true
            },
            retention: {
                required: true
            },
            "privacy,private_password,private_password_again": {
                conform: function (privacy, private_password, private_password_again) {
                    console.log(arguments);
                }
            }
        }),
        destroy: new Schema({
            _id: {
                required: true
            }
        })
    }
})(v);