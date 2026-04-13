fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ documentText: 'Hello this is a test document.', question: 'What is this?' })
}).then(res => res.json()).then(console.log).catch(console.error);
