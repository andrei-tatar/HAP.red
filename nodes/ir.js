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

        var pulses = [], i;
        for (i=0; i<buffer.length; i+=2) {
            var pulse = (buffer[i] << 8) | buffer[i+1];
            pulses.push(pulse);
        }

        for (i=0; i<ir_plugins.length; i++) {
            var decoded = ir_plugins[i].decode(pulses);
            if (decoded)
                return decoded;
        }
    }

    function encode(code) {
        for (var i=0; i<ir_plugins.length; i++) {
            var pulses = ir_plugins[i].encode(code);
            if (pulses) {
                var data = [];
                for (i=0; i<pulses.length; i++) {
                    var pulse = pulses[i];
                    data.push(pulse >> 8);
                    data.push(pulses & 0xFF);
                }

                return new Buffer(data);
            }
        }
    }

    RED.nodes.registerType("ir", IrNode);
};