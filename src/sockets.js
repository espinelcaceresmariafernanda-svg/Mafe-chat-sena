module.exports = function (io) {

    let users = {}; // Ahora es un objeto para guardar nombre + conexión

    io.on('connection', socket => {
        console.log("Nuevo Usuario conectado");

        socket.on('nuevo usuario', (data, cb) => {
            if (!data || data.trim() === '') {
                cb(false);
                return;
            }

            const cleanName = data.trim();

            if (cleanName in users) {
                cb(false);
            } else {
                cb(true);
                socket.nickname = cleanName;
                users[socket.nickname] = socket; // Guardamos la conexión completa del usuario
                updateNicknames();

                io.sockets.emit('usuario conectado', socket.nickname);
            }
        });

        socket.on("Enviar mensaje", function (data, cb) {
            if (!data || data.trim() === '') return;

            let msg = data.trim();

            // LÓGICA DE MENSAJE PRIVADO: /w nombre mensaje
            if (msg.substr(0, 3) === '/w ') {
                msg = msg.substr(3);
                const index = msg.indexOf(' ');
                
                if (index !== -1) {
                    var name = msg.substring(0, index);
                    var msgContent = msg.substring(index + 1);
                    
                    if (name in users) {
                        // ENVIAR SOLO AL DESTINATARIO
                        users[name].emit('whisper', {
                            msg: msgContent,
                            nick: socket.nickname
                        });
                        // Enviártelo a ti mismo para que veas que sí se envió
                        socket.emit('whisper', {
                            msg: msgContent,
                            nick: socket.nickname
                        });
                    } else {
                        cb('Error: El usuario no existe.');
                    }
                } else {
                    cb('Error: Formato incorrecto. Usa /w nombre mensaje');
                }
            } else {
                // MENSAJE NORMAL (PARA TODOS)
                io.sockets.emit('Nuevo mensaje', {
                    msg: data.trim(),
                    nick: socket.nickname
                });
            }
        });

        socket.on('disconnect', data => {
            if (!socket.nickname) return;
            delete users[socket.nickname]; // Borramos al usuario al desconectarse
            updateNicknames();
            io.sockets.emit('usuario desconectado', socket.nickname);
        });

        function updateNicknames() {
            // Enviamos solo los nombres (las llaves del objeto) al front-end
            io.sockets.emit('usernames', Object.keys(users));
        }
    });
}