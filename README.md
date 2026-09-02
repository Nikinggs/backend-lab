# Backend Lab --- CSV Processing, Streams, Pipeline & Bun

This project is a backend/data-processing lab focused on working with
large CSV files efficiently in Node.js and Bun.

The lab covers:

-   Generating large CSV datasets
-   Reading files with a buffered approach
-   Reading files with streams
-   Aggregating sales/revenue data
-   Writing summary data to a CSV file
-   Comparing buffered reads and streamed reads
-   Copying files with Node.js `pipeline()`
-   Processing streamed data with Bun
-   Understanding why streams use less memory

------------------------------------------------------------------------

## 1. Project Overview

The dataset contains sales records with the following fields:

``` text
countries, product, quantity, price
```

Each record represents a product sale.

For every row:

-   `countries` identifies the country
-   `product` identifies the product
-   `quantity` is the number of units sold
-   `price` is the price per unit

Revenue for each row is calculated as:

``` text
revenue = quantity × price
```

The supported countries are:

-   NG --- Nigeria
-   GH --- Ghana
-   KE --- Kenya
-   ZA --- South Africa
-   MA --- Morocco

The main goal is to calculate total revenue per country and the overall
total revenue.

------------------------------------------------------------------------

## 2. Technologies Used

-   **Node.js** --- file system operations and stream processing
-   **Bun** --- alternative JavaScript runtime and streaming APIs
-   **JavaScript (ES Modules)** --- application code
-   **CSV** --- input and output data format
-   **VS Code** --- development environment

Node.js version used during the lab:

``` text
v25.9.0
```

Bun version used:

``` text
1.4.0
```

------------------------------------------------------------------------

## 3. Project Structure

The main files created during the lab are:

``` text
backend-lab/
│
├── data.csv
├── data-copy.csv
├── summary.csv
│
├── generate.js
├── parse-buffer.js
├── parse-stream.js
├── write-summary.js
├── pipeline.js
├── parse-bun.js
└── parse-bun-stream.js
```

### File descriptions

  -----------------------------------------------------------------------
  File                                Purpose
  ----------------------------------- -----------------------------------
  `generate.js`                       Generates the CSV dataset

  `parse-buffer.js`                   Reads the entire CSV into memory
                                      and processes it

  `parse-stream.js`                   Processes the CSV using a Node.js
                                      readable stream

  `write-summary.js`                  Calculates totals and writes them
                                      to `summary.csv`

  `pipeline.js`                       Copies the CSV using Node.js
                                      `pipeline()`

  `parse-bun.js`                      Processes the complete CSV using
                                      Bun's file API

  `parse-bun-stream.js`               Processes the CSV as a stream using
                                      Bun

  `data.csv`                          Generated sales dataset

  `data-copy.csv`                     File copied using `pipeline()`

  `summary.csv`                       Revenue summary by country
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 4. Generating the CSV Dataset

The dataset was generated with `generate.js`.

The generator initially created **10,000 rows**.

The number of rows was later increased to:

``` js
const ROWS = 1_000_000;
```

The generator uses five countries:

``` js
const countries = ['NG', 'GH', 'KE', 'ZA', 'MA'];
```

Each row receives:

-   A country
-   A product name
-   A random quantity
-   A random price

Example command:

``` bash
node generate.js
```

Output:

``` text
Generated data.csv with 1000000 rows
```

### Important note

The generator itself creates the complete CSV content before writing it
to disk. Therefore, the generator is not the main demonstration of
memory-efficient processing.

The memory-efficiency lesson comes from how the generated file is **read
and processed**.

------------------------------------------------------------------------

# 5. Buffered File Processing

The first processing approach uses Node.js `readFileSync()`.

Example:

``` js
const data = readFileSync("data.csv", "utf8");
```

This loads the entire file into memory.

The data can then be split into lines:

``` js
const lines = data.split("\n").slice(1);
```

Each line is parsed and its revenue is added to the appropriate country
total.

## How buffered processing works

``` text
data.csv
   │
   ▼
Read entire file
   │
   ▼
Store complete file in RAM
   │
   ▼
Split into lines
   │
   ▼
Process every row
   │
   ▼
Calculate totals
```

### Advantage

For relatively small files, buffered processing can be simple and fast.

### Disadvantage

The entire file must fit into memory.

As the file becomes very large, memory usage can become a problem.

------------------------------------------------------------------------

# 6. Streamed File Processing

The second approach uses Node.js streams:

``` js
createReadStream("data.csv")
```

The stream reads the file incrementally rather than loading the entire
file into memory.

`readline` was used to process the file line by line.

Example:

``` js
const fileStream = createReadStream("data.csv", {
  encoding: "utf8",
});
```

Then:

``` js
const readline = createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});
```

The rows can be processed using:

``` js
for await (const line of readline) {
    // process line
}
```

## How streaming works

``` text
data.csv
   │
   ▼
Read a chunk
   │
   ▼
Process data
   │
   ▼
Discard processed data
   │
   ▼
Read next chunk
   │
   ▼
Continue until the file ends
```

### Advantage

Only a small portion of the file needs to be held in memory at a time.

This makes streams much more suitable for very large files.

### Important observation

A stream is **not automatically faster** than a buffered read.

The main advantage demonstrated here is memory efficiency and
scalability.

------------------------------------------------------------------------

# 7. Revenue Aggregation

For every CSV row, revenue is calculated using:

``` text
revenue = quantity × price
```

The results are accumulated in an object:

``` js
const totals = {
  NG: 0,
  GH: 0,
  KE: 0,
  ZA: 0,
  MA: 0,
};
```

The total revenue is also tracked:

``` js
let totalRevenue = 0;
```

For each row:

``` js
const revenue = parseFloat(quantity) * parseFloat(price);

totals[country] += revenue;
totalRevenue += revenue;
```

This produces:

-   Revenue for NG
-   Revenue for GH
-   Revenue for KE
-   Revenue for ZA
-   Revenue for MA
-   Overall revenue

------------------------------------------------------------------------

# 8. 10,000-Row Benchmark

The same 10,000-row dataset was processed using both Node.js approaches.

## Buffered read

``` text
Time taken: 24.94 ms
```

## Streamed read

``` text
Time taken: 43.49 ms
```

Both approaches produced the same total:

``` text
Total Revenue: $24505702.04
```

### Observation

For this relatively small dataset:

``` text
Buffered read → faster
Streamed read → slower
```

This is expected because streams have additional processing overhead.

However, streams have a major advantage when datasets become much larger
because they avoid loading the entire file into memory.

------------------------------------------------------------------------

# 9. Increasing the Dataset to 1,000,000 Rows

The dataset was increased from:

``` text
10,000 rows
```

to:

``` text
1,000,000 rows
```

The file was regenerated with:

``` bash
node generate.js
```

Output:

``` text
Generated data.csv with 1000000 rows
```

Both processing approaches were then tested again.

------------------------------------------------------------------------

# 10. 1-Million-Row Buffered Benchmark

The buffered parser was run multiple times.

Results:

``` text
960.61 ms
917.85 ms
832.90 ms
716.15 ms
```

Average:

``` text
856.88 ms
```

The resulting totals were:

``` text
NG: $495827934.79
GH: $495156895.06
KE: $496915589.70
ZA: $494751580.34
MA: $493202191.06

Total Revenue: $2475854190.95
```

------------------------------------------------------------------------

# 11. 1-Million-Row Stream Benchmark

The streamed parser was also tested multiple times.

Results:

``` text
2515.55 ms
913.14 ms
1204.44 ms
826.82 ms
830.82 ms
884.27 ms
810.63 ms
824.89 ms
```

Average:

``` text
1101.32 ms
```

The totals matched the buffered approach exactly:

``` text
NG: $495827934.79
GH: $495156895.06
KE: $496915589.70
ZA: $494751580.34
MA: $493202191.06

Total Revenue: $2475854190.95
```

------------------------------------------------------------------------

# 12. Buffer vs Stream Comparison

The measured averages for the 1-million-row dataset were:

  Approach           Average Time Main Characteristic
  ---------------- -------------- -------------------------------------
  Node.js Buffer        856.88 ms Loads the complete file into memory
  Node.js Stream       1101.32 ms Processes data incrementally
  Bun Stream            534.07 ms Processes data incrementally

The benchmark shows that the buffered approach was faster than the
Node.js stream in this particular environment.

This does **not** mean buffered processing is always better.

The important difference is memory usage.

### Buffered approach

``` text
Entire file → RAM → process
```

### Streaming approach

``` text
Small chunk → process → discard
Small chunk → process → discard
Small chunk → process → discard
```

For very large files, streaming can prevent memory usage from growing
with the entire file size.

Benchmark times can also vary because of:

-   Operating-system scheduling
-   CPU activity
-   Background applications
-   Disk/cache state
-   Runtime optimizations

Therefore, a single benchmark should not be treated as a universal
performance result.

------------------------------------------------------------------------

# 13. Writing the Summary CSV

The `write-summary.js` script creates:

``` text
summary.csv
```

The output format is:

``` csv
country,total_revenue
NG,4962285.15
GH,5235910.46
KE,4902789.78
ZA,4828165.77
MA,4576550.88
```

The output contains one row per country.

The script uses:

``` js
createWriteStream("summary.csv")
```

This demonstrates writing output using a stream as well.

The general process is:

``` text
data.csv
   │
   ▼
Read data
   │
   ▼
Calculate revenue
   │
   ▼
Group totals by country
   │
   ▼
Write summary.csv
```

------------------------------------------------------------------------

# 14. Node.js `pipeline()`

The project also demonstrates Node.js `pipeline()`.

The `pipeline.js` file copies:

``` text
data.csv
```

to:

``` text
data-copy.csv
```

using:

``` js
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

const source = createReadStream("data.csv");
const destination = createWriteStream("data-copy.csv");

await pipeline(source, destination);

console.log("Pipeline copy completed.");
```

Running:

``` bash
node pipeline.js
```

produces:

``` text
Pipeline copy completed.
```

The resulting `data-copy.csv` was verified to be identical to the
original `data.csv`.

## Why `pipeline()` is useful

It connects streams together while handling stream completion and errors
more reliably than manually wiring everything together.

Conceptually:

``` text
Readable Stream
      │
      ▼
   pipeline()
      │
      ▼
Writable Stream
```

------------------------------------------------------------------------

# 15. Bun Processing

Bun was also used to process the dataset.

Bun provides its own file API:

``` js
const data = await Bun.file("data.csv").text();
```

This approach reads the entire file into memory, similar to the buffered
Node.js approach.

The Bun parser successfully produced:

``` text
Total Revenue: $2475854190.95
```

------------------------------------------------------------------------

# 16. Bun Streaming

The final processing approach used Bun's streaming API:

``` js
const file = Bun.file("data.csv");
const stream = file.stream();
```

A reader was obtained with:

``` js
const reader = stream.getReader();
```

Chunks were decoded using:

``` js
const decoder = new TextDecoder();
```

Because a chunk can end in the middle of a CSV line, the implementation
keeps an unfinished piece of text in:

``` js
let leftover = "";
```

The next chunk is then combined with the leftover text.

This is important when manually processing streamed text because stream
chunks do not necessarily line up with complete lines.

The final implementation also processes the last `leftover` after the
stream ends.

------------------------------------------------------------------------

# 17. Bun Stream Result

The corrected Bun streaming parser produced:

``` text
Revenue by country:
NG: $495827934.79
GH: $495156895.06
KE: $496915589.70
ZA: $494751580.34
MA: $493202191.06

Total Revenue: $2475854190.95
Time taken: 534.07 ms

Approach D (Bun streamed read) completed.
```

The result matched the Node.js implementations.

------------------------------------------------------------------------

# 18. Why Streams Use Less Memory

A buffered approach reads the whole file:

``` text
10 GB file
     │
     ▼
10 GB approximately loaded into memory
```

A stream processes the file progressively:

``` text
10 GB file
     │
     ├── small chunk → process → discard
     ├── small chunk → process → discard
     ├── small chunk → process → discard
     └── continue...
```

Therefore, the application's memory requirement does not need to
increase in proportion to the entire file size.

This makes streams especially useful for:

-   Large CSV files
-   Log files
-   Large uploads/downloads
-   HTTP request/response bodies
-   Data pipelines
-   ETL processing
-   Large database exports

------------------------------------------------------------------------

# 19. Key Lessons Learned

## Buffered reads

Buffered reads are simple and can be very fast for smaller files.

``` js
readFileSync()
```

However, the entire file is stored in memory.

------------------------------------------------------------------------

## Streams

Streams process data incrementally.

``` js
createReadStream()
```

They are more memory-efficient and better suited to large datasets.

Streams may have additional overhead, so they are not guaranteed to be
faster.

------------------------------------------------------------------------

## `pipeline()`

`pipeline()` provides a clean way to connect readable and writable
streams.

``` js
await pipeline(source, destination);
```

It is useful for reliable stream-based data movement.

------------------------------------------------------------------------

## Bun

Bun provides fast file and streaming APIs.

The Bun streaming implementation successfully processed the same
1-million-row dataset while producing exactly the same revenue totals.

------------------------------------------------------------------------

## Streaming chunks are not guaranteed to be complete lines

When manually processing a stream, a chunk may end halfway through a
line.

Therefore, streamed text processing may need to keep an unfinished piece
of data and combine it with the next chunk.

This was demonstrated with:

``` js
let leftover = "";
```

------------------------------------------------------------------------

# 20. Final Results

For the 1-million-row dataset:

``` text
Total Revenue:
$2,475,854,190.95
```

Revenue by country:

``` text
NG: $495,827,934.79
GH: $495,156,895.06
KE: $496,915,589.70
ZA: $494,751,580.34
MA: $493,202,191.06
```

Benchmark averages:

``` text
Node.js buffered read: 856.88 ms
Node.js streamed read: 1101.32 ms
Bun streamed read:      534.07 ms
```

The most important conclusion is:

> **Streams are primarily valuable because they control memory usage and
> allow large amounts of data to be processed incrementally. They are
> not automatically faster than buffered reads.**

------------------------------------------------------------------------

# 21. Running the Project

### Generate the dataset

``` bash
node generate.js
```

### Run buffered processing

``` bash
node parse-buffer.js
```

### Run Node.js streamed processing

``` bash
node parse-stream.js
```

### Generate the summary

``` bash
node write-summary.js
```

### Copy the file using `pipeline()`

``` bash
node pipeline.js
```

### Run the Bun buffered parser

``` bash
& "$HOME\.bun\bin\bun.exe" parse-bun.js
```

### Run the Bun streamed parser

``` bash
& "$HOME\.bun\bin\bun.exe" parse-bun-stream.js
```

> On this Windows PowerShell setup, Bun was installed and verified as
> version `1.4.0`, but the `bun` command was not directly recognized in
> the current PowerShell session. The executable could be run directly
> from `C:\Users\USER\.bun\bin\bun.exe`.

------------------------------------------------------------------------

# 22. Conclusion

This lab demonstrates an important backend engineering concept: **how
data-processing strategy affects memory usage and scalability**.

A buffered approach is convenient and can be very fast when the input is
reasonably small.

A streaming approach is better when the input can become too large to
comfortably fit in memory.

The project also demonstrates how Node.js streams can be connected with
`pipeline()` and how Bun can be used as an alternative JavaScript
runtime for file processing.

The same 1-million-row dataset was successfully processed using multiple
approaches, and all implementations produced the same revenue totals.
