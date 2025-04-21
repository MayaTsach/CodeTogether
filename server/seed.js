const mongoose = require("mongoose");
const CodeBlock = require("./models/CodeBlock");

const MONGO_URI =
  "mongodb+srv://tsachmaya:Maya6516313%21@codetogethercluster.yawpdvd.mongodb.net/codetogether?retryWrites=true&w=majority&appName=CodeTogetherCluster";

const codeBlocks = [
  {
    title: "Add Two Numbers",
    instructions: "Implement the function so it returns the sum of two numbers.",
    initialCode: `function add(a, b) {

}`,
    solutionCode: `function add(a, b) {
  return a + b;
}`
  },
  {
    title: "Check Even Number",
    instructions: "Write a function that returns true if a number is even, otherwise false.",
    initialCode: `function isEven(n) {

}`,
    solutionCode: `function isEven(n) {
  return n % 2 === 0;
}`
  },
  {
    title: "Find Max",
    instructions: "Write a function that returns the maximum of two numbers.",
    initialCode: `function max(a, b) {

}`,
    solutionCode: `function max(a, b) {
  return a > b ? a : b;
}`
  },
  {
    title: "Reverse String",
    instructions: "Write a function that returns the reversed version of a string.",
    initialCode: `function reverse(str) {

}`,
    solutionCode: `function reverse(str) {
  return str.split('').reverse().join('');
}`
  }
];

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("📍 Using database:", mongoose.connection.name);

    await CodeBlock.deleteMany();
    await CodeBlock.insertMany(codeBlocks);
    console.log("✅ Seeded code blocks successfully.");

    const all = await CodeBlock.find();
    console.log("📦 DB now contains:", all);
    process.exit();
  } catch (err) {
    console.error("❌ Failed to seed DB:", err);
    process.exit(1);
  }
}

seedDB();
