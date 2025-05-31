const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client;
let isUnlinked = false;
let restartAttempts = 0;
const MAX_RESTARTS = 10;

function startClient() {

    client = new Client();

    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        if (!isUnlinked) {
            console.log(`Client is ready! (Попытка ${restartAttempts})`);
        } else {
            console.log('Client is ready, но сессия отвязана - дальнейшая работа остановлена.');
        }
    });

    client.on('disconnected', (reason) => {
        console.log('Client was unlink');
        console.log('Причина: ', reason);
        if (reason === 'REMOTE_SESSION_LOGOUT') {
            console.log('Сессия была отвязана от телефона');
            isUnlinked = true;
        } else if (restartAttempts < MAX_RESTARTS) {
            restartAttempts++;
            console.log(`Перезапуск клиента... Попытка ${restartAttempts}/${MAX_RESTARTS}`);

            client.destroy()
                .then(() => {
                    startClient();
                })
                .catch(err => {
                    console.error('Error при уничтожении клиента: ', err);
                });
        } else {
            console.log('Достигнут лимит попыток подключения. Клиент не будет перезапущен.');
        }
    });

    client.initialize();
}
startClient();