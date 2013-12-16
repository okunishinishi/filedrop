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
            salt: 'ZQfMfvdPhabs2dbox9iT6MFuSQLbWKKHV4EFHM6FpB19zg/mvyxFI837a2sv/ZZAFGC5CSxwuACgtpGnXPn0Zj0pqluTYLkhv2u4zEe9oL6VO1x7SynuQgiakUSOty6xygQ+btE+COxcUXJP1JrQutuy/JsDvDvbP+eICVdPTzs=',
            privacy: "${choice('public', 'public')}"
        }.repeat(10)
    ]
};