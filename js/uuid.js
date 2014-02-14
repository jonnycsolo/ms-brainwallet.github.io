if (typeof UUID === "undefined" || !UUID) {
(function(){
    var UUID = window.UUID = (function() {
        var _hash = function(version, hash) {
            return hash.substr(0,8) + '-' +
                hash.substr(8,4) + '-' +
                (version + hash.substr(13,3)) + '-' +
                ((parseInt(hash.substr(16, 2), 16) | 0x80) & 0xBF).toString(16) + hash.substr(18,2) + '-' +
                hash.substr(20,12);
        },
        _clk = parseInt(Crypto.util.bytesToHex(Crypto.util.randomBytes(2)), 16);

        return {
            DNS:  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
            URL:  '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
            OID:  '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
            X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
            v1: function() {
                var time = (((new Date()).getTime() - Date.UTC(1582, 9, 15)) * 1E4).toString(16),
                    clk = ((++_clk | 0x8000) & 0xBFFF).toString(16),
                    node = Crypto.util.bytesToHex(Crypto.util.randomBytes(6));
                node = (parseInt(node.substr(0,2), 16) | 0x01).toString(16) + node.substr(2);
                node = (node.length < 12 ? '0' : '') + node;
                return time.substr(time.length - 8, 8) + '-' +
                    time.substr(time.length - 12, 4) + '-' +
                    '1' + time.substr(time.length - 15, 3) + '-' +
                    clk + '-' + node;
            },
            v3: function(namespace, name) {
                var hash = Crypto.MD5(
                    Crypto.util.hexToBytes(namespace.replace(/[{}\-]/g, ''))
                        .concat(Crypto.charenc.UTF8.stringToBytes(name))
                );
                return _hash(3, hash);
            },
            v4: function() {
                return _hash(4, Crypto.util.bytesToHex(Crypto.util.randomBytes(16)));
            },
            v5: function(namespace, name) {
                var hash = Crypto.SHA1(
                    Crypto.util.hexToBytes(namespace.replace(/[{}\-]/g, ''))
                        .concat(Crypto.charenc.UTF8.stringToBytes(name))
                );
                return _hash(5, hash);
            }
        };
    }());
})();
}