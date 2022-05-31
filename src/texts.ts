export function intToString(num: number, digitCount: number = 0) {
    const sign = num < 0 ? '-' : ' ';
    let result = num.toString();
    return sign + (digitCount <= 0 ? result : result.padStart(digitCount - 1, '0'));
}

export function floatToString(num: number, digitCount: number = 0, fractionCount: number = 0) {
    const sign = num < 0 ? '-' : ' ';
    let [digitPart, fractionPart] = Math.abs(num).toFixed(Math.max(1, fractionCount)).split('.');

    if (digitCount > 0) {
        digitPart = digitPart.padStart(digitCount - 1, '0');
    }
    if (fractionCount > 0) {
        fractionPart = fractionCount < fractionPart.length ? fractionPart.slice(0, fractionCount) : fractionPart.padEnd(fractionCount, '0');
    }

    return sign + digitPart + '.' + fractionPart;
}

export function hexToFloat(str: string): number {
    return parseFloat('0x' + str);
}

export function stringToFloat(str: string): number {
    return parseFloat(str);
}