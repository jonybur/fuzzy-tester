fn main(
    x: u64, y: u64, sumResult: u64, subtractResult: Field//, multiplyResult: u64, 
    // divideResult: u64, xorResult: u64, andResult: u64, orResult: u64, 
    // leftShiftResult: u64, rightShiftResult: u64, bitwiseNotResult: u64, 
    // lessThanResult: bool, lessThanOrEqualResult: bool, greaterThanResult: bool,
    // greaterThanOrEqualResult: bool, equalsResult: bool, notEqualsResult: bool
) {
    assert(sum(x, y) == sumResult);
    assert(subtract(x, y) == subtractResult);
    // assert(multiply(x, y) == multiplyResult);
    // assert(divide(x, y) == divideResult);
    // assert(xor(x, y) == xorResult);
    // assert(and(x, y) == andResult);
    // assert(or(x, y) == orResult);
    // assert(left_shift(x, y) == leftShiftResult);
    // assert(right_shift(x, y) == rightShiftResult);
    // assert(bitwise_not(x) == bitwiseNotResult);
    // assert(less_than(x, y) == lessThanResult);
    // assert(less_than_or_equal(x, y) == lessThanOrEqualResult);
    // assert(greater_than(x, y) == greaterThanResult);
    // assert(greater_than_or_equal(x, y) == greaterThanOrEqualResult);
    // assert(equals(x, y) == equalsResult);
    // assert(not_equals(x, y) == notEqualsResult);
}

fn sum(x: u64, y: u64) -> u64 {
    x + y
}

fn subtract(x: u64, y: u64) -> Field {
    x - y
}

fn multiply(x: u64, y: u64) -> u64 {
    x * y
}

fn divide(x: u64, y: u64) -> u64 {
    x / y
}

fn xor(x: u64, y: u64) -> u64 {
    x ^ y
}

fn and(x: u64, y: u64) -> u64 {
    x & y
}

fn or(x: u64, y: u64) -> u64 {
    x | y
}

fn left_shift(x: u64, y: u64) -> u64 {
    x << y
}

fn right_shift(x: u64, y: u64) -> u64 {
    x >> y
}

fn bitwise_not(x: u64) -> u64 {
    !x
}

fn less_than(x: u64, y: u64) -> bool {
    x < y
}

fn less_than_or_equal(x: u64, y: u64) -> bool {
    x <= y
}

fn greater_than(x: u64, y: u64) -> bool {
    x > y
}

fn greater_than_or_equal(x: u64, y: u64) -> bool {
    x >= y
}

fn equals(x: u64, y: u64) -> bool {
    x == y
}

fn not_equals(x: u64, y: u64) -> bool {
    x != y
}
