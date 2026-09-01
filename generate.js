import {writeFileSync} from 'fs';

const ROWS = 10_000;
const countries = ['NG', 'GH', 'KE', 'ZA', 'MA'];
const rows = ['country, product, quantity, price'];

for (let i = 0; i < ROWS; i++) {
  const country = countries[Math.floor(Math.random() * countries.length)];
  const product = `Product ${i}`;
  const quantity = Math.floor(Math.random() * 100);
  const price = (Math.random() * 100).toFixed(2);
  rows.push(`${country},${product},${quantity},${price}`);
}
writeFileSync('data.csv', rows.join('\n'));

console.log(`Generated data.csv with ${ROWS} rows`);