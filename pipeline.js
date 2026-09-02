import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

const source = createReadStream("data.csv");
const destination = createWriteStream("data-copy.csv");

await pipeline(source, destination);

console.log("Pipeline copy completed.");