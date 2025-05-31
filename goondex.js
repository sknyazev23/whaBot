const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config({ path: './.env.gemini' });

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

let client;
let isUnlinked = false;
let restartAttempts = 0;
const MAX_RESTARTS = 10;




let history = [];

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

    client.on('message', async (msg) => {
        if (isUnlinked) return; // не обрабатывать, если сессия отвязана
        if (!msg.body || msg.fromMe) return;

        console.log(`Сообщение от ${msg.from}: ${msg.body}`);
        history.push({ role: 'user', parts: msg.body }); // сообщение в историю

        try {
            const result = await model.generateContent(msg.body);
            const response = await result.response;
            const text = response.text();

            history.push({ role: 'model', parts: text });  // ответ в историю
            await msg.reply(text);

        } catch (error) {
            console.error('Error of Gemini: ', error);
            await msg.reply('Произошла ошибка при попытке ответа через... ');
        }
    });

    client.initialize();
}
startClient();