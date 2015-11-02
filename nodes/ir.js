var ir_plugins = [
    new (require('./decoders/nec'))(),
    new (require('./decoders/samsung'))()
];

module.exports = function(RED) {
    function IrNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function(msg) {
            var forward;
            if (typeof msg.payload === 'string') {
                var pulses = encode(msg.payload);
                if (!pulses)
                    throw new Error("No compatible encoder for " + msg.payload);
                msg.payload = pulses;
            } else {
                var decoded = decodePulses(msg.payload);
                if (!decoded) return;
                msg.payload = decoded;
            }

            node.send(msg);
        });
    }

    function decodePulses(buffer) {
        if (buffer.length % 2 != 0)
            return;

        var pulses = [];
        for (var i=0; i<buffer.length; i+=2) {
            var pulse = (buffer[i] << 8) | buffer[i+1];
            pulses.push(pulse);
        }

        for (var j=0; j<ir_plugins.length; j++) {
            var decoded = ir_plugins[j].decode(pulses);
            if (decoded)
                return decoded;
        }
    }

    function encode(code) {
        for (var i=0; i<ir_plugins.length; i++) {
            var pulses = ir_plugins[i].encode(code);
            if (pulses) {
                var data = new Buffer(pulses.length * 2);
                for (var j=0; j<pulses.length; j++) {
                    var pulse = pulses[j];
                    data[j*2]   = pulse >> 8;
                    data[j*2+1] = pulse & 0xFF;
                }
                return data;
            }
        }
    }

    RED.nodes.registerType("ir", IrNode);
};