const pdf = require('pdf-parse');
const fs = require('fs');

async function main() {
  const filePath = process.argv[2];
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);
  // output just the text
  process.stdout.write(data.text);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
