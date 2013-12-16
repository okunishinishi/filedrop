/**
 * validation for user room
 */
v.room = (function (v) {
    var Schema = v.Schema;
    return {
        insert: new Schema({
            name: {
                required:    true
            }
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
                conform: function (values, callback) {
                    var privacy = values[0],
                        private_password = values[1],
                        private_password_again = values[2];
                    var err = null;
                    switch (privacy) {
                        case 'private':
                            var password_match = private_password == private_password_again;
                            if(!password_match){
                                err = {
                                    cause: 'password_mismatch'
                                };
                            }
                            break;
                    }
                    callback && callback(err);
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