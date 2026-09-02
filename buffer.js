const buffer = Buffer.from("Hello World");

console.log("Original:", buffer.toString("utf8"));
console.log("Hexadecimal:", buffer.toString("hex"));
console.log("Base64:", buffer.toString("base64"));