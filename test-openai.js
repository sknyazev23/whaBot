require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

(async () => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: 'Привет! Как дела?' }
    ],
  });

  console.log(response.choices[0].message.content);
})();
