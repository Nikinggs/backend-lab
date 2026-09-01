import { readFileSync, createWriteStream } from "node:fs";

const data = readFileSync("data.csv", "utf8");

const lines = data.split("\n").slice(1);

const totals = {
  NG: 0,
  GH: 0,
  KE: 0,
  ZA: 0,
  MA: 0,
};

for (const line of lines) {
  if (!line.trim()) continue;

  const [country, product, quantity, price] = line.split(",");

  const revenue = parseFloat(quantity) * parseFloat(price);

  totals[country] += revenue;
}

const out = createWriteStream("summary.csv");

out.write("country,total_revenue\n");

for (const [country, total] of Object.entries(totals)) {
  out.write(`${country},${total.toFixed(2)}\n`);
}

out.end();

console.log("Summary written to summary.csv");