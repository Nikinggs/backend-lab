const start = performance.now();

const file = Bun.file("data.csv");
const stream = file.stream();

const reader = stream.getReader();
const decoder = new TextDecoder();

const totals = {
  NG: 0,
  GH: 0,
  KE: 0,
  ZA: 0,
  MA: 0,
};

let totalRevenue = 0;
let leftover = "";
let isFirstLine = true;

function processLine(line) {
  if (!line.trim()) return;

  if (isFirstLine) {
    isFirstLine = false;
    return;
  }

  const [country, product, quantity, price] = line.split(",");

  const revenue = parseFloat(quantity) * parseFloat(price);

  totals[country] += revenue;
  totalRevenue += revenue;
}

while (true) {
  const { done, value } = await reader.read();

  if (done) break;

  const text = decoder.decode(value, { stream: true });

  const lines = (leftover + text).split("\n");

  leftover = lines.pop();

  for (const line of lines) {
    processLine(line);
  }
}

// Process the final line
if (leftover) {
  processLine(leftover);
}

const end = performance.now();

console.log("Revenue by country:");

for (const [country, total] of Object.entries(totals)) {
  console.log(`${country}: $${total.toFixed(2)}`);
}

console.log(`Total Revenue: $${totalRevenue.toFixed(2)}`);
console.log(`Time taken: ${(end - start).toFixed(2)} ms`);
console.log("Approach D (Bun streamed read) completed.");