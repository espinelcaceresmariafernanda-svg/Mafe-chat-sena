$(function(){
    const socket = io();

    const $messageForm = $('#message-form');
    const $messageBox = $('#message');
    const $chat = $('#chat');

    const $nickForm = $('#nickForm');
    const $nickError = $('#nickError');
    const $nickname = $('#nickname');
    const $users = $('#usernames');

    let myNickname = '';

    $nickForm.submit( e => {
        e.preventDefault();
        const nick = $nickname.val().trim();
        if(nick === ''){
            $nickError.html('<div class="alert alert-warning">El nombre no puede estar vacío.</div>');
            return;
        }

        socket.emit('nuevo usuario', nick, data => {
            if(data){
                myNickname = nick;
                $('#nickWrap').hide();
                $('#contentWrap').show();
            } else {
                $nickError.html('<div class="alert alert-danger">El nombre de usuario ya existe.</div>');
            }
            $nickname.val('');
        });
    });

    $messageForm.submit( e => {
        e.preventDefault();
        const msg = $messageBox.val().trim();
        if(msg === '') return;

        // Enviamos el mensaje y añadimos una función para recibir errores (como "usuario no existe")
        socket.emit('Enviar mensaje', msg, data => {
            $chat.append(`<div class="msg-system text-danger"><em>${data}</em></div>`);
            $chat.scrollTop($chat[0].scrollHeight);
        });
        $messageBox.val('');
    });

    socket.on('Nuevo mensaje', function (data){
        const isMe = data.nick === myNickname;
        const msgHtml = isMe
            ? `<div class="msg msg-me"><span class="msg-nick">Tú</span> ${data.msg}</div>`
            : `<div class="msg msg-other"><span class="msg-nick">${data.nick}</span> ${data.msg}</div>`;
        $chat.append(msgHtml);
        $chat.scrollTop($chat[0].scrollHeight);
    });

    // === AQUÍ ESTÁ EL ARREGLO PARA LOS MENSAJES PRIV