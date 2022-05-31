"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToFloat = exports.hexToFloat = exports.floatToString = exports.intToString = void 0;
function intToString(num, digitCount) {
    if (digitCount === void 0) { digitCount = 0; }
    var sign = num < 0 ? '-' : ' ';
    var result = num.toString();
    return sign + (digitCount <= 0 ? result : result.padStart(digitCount - 1, '0'));
}
exports.intToString = intToString;
function floatToString(num, digitCount, fractionCount) {
    if (digitCount === void 0) { digitCount = 0; }
    if (fractionCount === void 0) { fractionCount = 0; }
    var sign = num < 0 ? '-' : ' ';
    var _a = Math.abs(num).toFixed(Math.max(1, fractionCount)).split('.'), digitPart = _a[0], fractionPart = _a[1];
    if (digitCount > 0) {
        digitPart = digitPart.padStart(digitCount - 1, '0');
    }
    if (fractionCount > 0) {
        fractionPart = fractionCount < fractionPart.length ? fractionPart.slice(0, fractionCount) : fractionPart.padEnd(fractionCount, '0');
    }
    return sign + digitPart + '.' + fractionPart;
}
exports.floatToString = floatToString;
function hexToFloat(str) {
    return parseFloat('0x' + str);
}
exports.hexToFloat = hexToFloat;
function stringToFloat(str) {
    return parseFloat(str);
}
exports.stringToFloat = stringToFloat;
//# sourceMappingURL=texts.js.map