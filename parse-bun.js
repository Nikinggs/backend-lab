const start = performance.now();

const data = await Bun.file("data.csv").text();

const lines = data.split("\n").slice(1);

const totals = {
  NG: 0,
  GH: 0,
  KE: 0,
  ZA: 0,
  MA: 0,
};

let totalRevenue = 0;

for (const line of lines) {
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
console.log("Approach C (Bun) completed.");