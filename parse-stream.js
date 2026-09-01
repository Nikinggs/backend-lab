import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

const start = performance.now();

const totals = {
  NG: 0,
  GH: 0,
  KE: 0,
  ZA: 0,
  MA: 0,
};

let totalRevenue = 0;

const fileStream = createReadStream("data.csv", {
  encoding: "utf8",
});

const readline = createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

let isFirstLine = true;

for await (const line of readline) {
  // Skip the CSV header
  if (isFirstLine) {
    isFirstLine = false;
    continue;
  }

  if (!line.trim()) continue;

  const [country, product, quantity, price] = line.split(",");

  const revenue = parseFloat(quantity) * parseFloat(price);

  totals[country] += revenue;
  totalRevenue += revenue;
}

const end = performance.now();

console.log("Revenue by country:");

for (const [country, total] of Object.entries(totals)) {
  console.log(`${country}: $${total.toFixed(2)}`);
}

console.log(`Total Revenue: $${totalRevenue.toFixed(2)}`);
console.log(`Time taken: ${(end - start).toFixed(2)} ms`);
console.log("Approach B (streamed read) completed.");