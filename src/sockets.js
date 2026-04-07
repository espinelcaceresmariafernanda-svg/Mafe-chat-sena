module.exports = function (io){

    let nicknames = [];

    io.on('connection', socket =>{
        console.log("Nuevo Usuario conectado");

        socket.on('nuevo usuario', (data, cb) => {
            // Limpieza de datos: rechazar nombres vacíos o solo espacios
            if (!data || data.trim() === '') {
                cb(false);
                return;
            }

            const cleanName = data.trim();

            if(nicknames.indexOf(cleanName) != -1){
                cb(false);
            } else {
                cb(true);
                socket.nickname = cleanName;
                nicknames.push(socket.nickname);
                updateNicknames();

                // Notificación de conexión: avisar a todos que alguien se unió
                io.sockets.emit('usuario conectado', socket.nickname);
            }
        });

        socket.on("Enviar mensaje", function(data){
            // Limpieza de datos: ignorar mensajes vacíos o solo espacios
            if (!data || data.trim() === '') return;

            io.sockets.emit('Nuevo mensaje', {
                msg: data.trim(),
                nick: socket.nickname
            });
        });

        socket.on('disconnect', data => {
            if(!socket.nickname) return;
            nicknames.splice(nicknames.indexOf(socket.nickname), 1);
            updateNicknames();

            // Notificación de desconexión
            io.sockets.emit('usuario desconectado', socket.nickname);
        });

        function updateNicknames(){
            io.sockets.emit('usernames', nicknames);
        }
    });
}