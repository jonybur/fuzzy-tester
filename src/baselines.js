const {
  generateValues,
  generateShiftValues,
  generateBitwiseValues,
} = require("./value_generators");
const { writeProver } = require("./files");

function sum(args) {
  const values = generateValues(args);
  values.result = values.x + values.y;
  writeProver("sum", values);
  return values.result;
}

function subtract(args) {
  const values = generateValues(args);
  values.result = values.x - values.y;
  writeProver("subtract", values);
  return values.result;
}

function multiply(args) {
  const values = generateValues(args);
  values.result = values.x * values.y;
  writeProver("multiply", values);
  return values.result;
}

function divide(args) {
  const values = generateValues(args);
  values.result = values.x / values.y;
  writeProver("divide", values);
  return values.result;
}

function xor(args) {
  const values = generateValues(args);
  values.result = values.x ^ values.y;
  writeProver("xor", values);
  return values.result;
}

function and(args) {
  const values = generateValues(args);
  values.result = values.x & values.y;
  writeProver("and", values);
  return values.result;
}

function or(args) {
  const values = generateValues(args);
  values.result = values.x | values.y;
  writeProver("or", values);
  return values.result;
}

function less_than(args) {
  const values = generateValues(args);
  values.result = values.x < values.y;
  writeProver("less_than", values);
  return values.result;
}

function less_than_or_equal(args) {
  const values = generateValues(args);
  values.result = values.x <= values.y;
  writeProver("less_than_or_equal", values);
  return values.result;
}

function greater_than(args) {
  const values = generateValues(args);
  values.result = values.x > values.y;
  writeProver("greater_than", values);
  return values.result;
}

function greater_than_or_equal(args) {
  const values = generateValues(args);
  values.result = values.x >= values.y;
  writeProver("greater_than_or_equal", values);
  return values.result;
}

function equals(args) {
  const values = generateValues(args);
  values.result = values.x == values.y;
  writeProver("equals", values);
  return values.result;
}

function not_equals(args) {
  const values = generateValues(args);
  values.result = values.x != values.y;
  writeProver("not_equals", values);
  return values.result;
}

function left_shift(args) {
  const values = generateShiftValues(args);
  values.result = values.x << values.y;
  writeProver("left_shift", values);
  return values.result;
}

function right_shift(args) {
  const values = generateShiftValues(args);
  values.result = values.x >> values.y;
  writeProver("right_shift", values);
  return values.result;
}

function bitwise_not(args) {
  const values = generateBitwiseValues(args);
  values.result = ~values.x;
  writeProver("bitwise_not", values);
  return values.result;
}

module.exports = {
  sum,
  multiply,
  and,
  right_shift,
  or,
  subtract,
  xor,
  not_equals,
  equals,
  greater_than,
  greater_than_or_equal,
  less_than_or_equal,
  less_than,
};
