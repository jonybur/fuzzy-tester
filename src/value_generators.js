const MAX_64_BIT = 18446744073709551615n;

function generateValues(args) {
  return {
    x:
      args?.["x"] !== undefined
        ? BigInt(args["x"])
        : getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n),
    y:
      args?.["y"] !== undefined
        ? BigInt(args["y"])
        : getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n),
  };
}

function generateShiftValues(args) {
  return {
    x:
      args?.["x"] !== undefined
        ? BigInt(args["x"])
        : getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n),
    y:
      args?.["y"] !== undefined
        ? BigInt(args["y"])
        : BigInt(Math.floor(Math.random() * 64)),
  };
}

function generateBitwiseValues(args) {
  return {
    x:
      args?.["x"] !== undefined
        ? BigInt(args["x"])
        : getRandomBigInt(MAX_64_BIT / 3n, MAX_64_BIT / 2n),
  };
}

function getRandomBigInt(min, max) {
  return min + BigInt(Math.floor(Math.random() * Number(max - min + 1n)));
}

module.exports = { generateValues, generateBitwiseValues, generateShiftValues };
