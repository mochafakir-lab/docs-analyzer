const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function main() {
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: 'Explain the importance of fast language models in one sentence.' }],
    model: 'llama-3.3-70b-versatile',
  });
  console.log(chatCompletion.choices[0].message.content);
}
main().catch(console.error);
