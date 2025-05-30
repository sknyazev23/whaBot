const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Бот готов...');
});

client.on('message', async msg => {
    const userMessage = msg.body;

    try {
        const res = await axios.post('http://localhost:5000/message', {
            message: userMessage
        });

        const reply = res.data.reply;
        await msg.reply(reply);

    } catch (err) {
        console.error('Ошибка запроса: ', err.message);
        await msg.reply('Произошла ошибка. ');
    }
});
client.initialize();