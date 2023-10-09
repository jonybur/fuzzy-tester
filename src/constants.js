const {
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
} = require("./baselines");

const PACKAGES = [
  { name: "sum", generator: sum },
  { name: "multiply", generator: multiply },
  { name: "and", generator: and },
  { name: "right_shift", generator: right_shift },
  { name: "or", generator: or },
  { name: "subtract", generator: subtract },
  { name: "xor", generator: xor },
  { name: "not_equals", generator: not_equals },
  { name: "equals", generator: equals },
  { name: "greater_than", generator: greater_than },
  { name: "greater_than_or_equal", generator: greater_than_or_equal },
  { name: "less_than_or_equal", generator: less_than_or_equal },
  { name: "less_than", generator: less_than },
  // NOT WORKING:
  // { name: "left_shift", generator: generateLeftShift },
  // { name: "divide", generator: generateDivide },
  // { name: "bitwise_not", generator: generateBitwiseNot },
];

module.exports = {
  PACKAGES,
};
