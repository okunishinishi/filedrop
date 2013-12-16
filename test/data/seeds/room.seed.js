Object.prototype.repeat = function (count) {
    var s = this;
    s._repeat = count;
    return s;
};

module.exports = {
    /** データ定義 **/
    entries: [
        {
            _id: "48${padZero(rownum, 22)}",
            name: "${flower}",
            privacy: "${choice('public', 'public')}"
        }.repeat(10)
    ]
};