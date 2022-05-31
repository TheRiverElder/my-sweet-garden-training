"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randInt = exports.rand = exports.arrayPeek = exports.arrayZip = exports.arraySum = exports.matCol = exports.matRow = exports.createMatrixFromArray = exports.matSet = exports.matGet = exports.matHeight = exports.matWidth = exports.matConcatHorizontal = exports.matSlice = exports.isInRange = exports.matTranspose = exports.matDot = exports.matPowExt = exports.matModExt = exports.matDivExt = exports.matMulExt = exports.matSubExt = exports.matAddExt = exports.matPow = exports.matMod = exports.matDiv = exports.matMul = exports.matSub = exports.matAdd = exports.matOpExt = exports.matOp = exports.createMatrix = exports.createArray = exports.matMap = exports.matForEach = void 0;
// function synchromorphify(pattern: Matrix, num: number) {
//     const height = pattern.length;
//     const width = height > 0 ? pattern[0].length : 0;
// }
function matForEach(matrix, fn) {
    var width = matWidth(matrix);
    var height = matHeight(matrix);
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            fn(matrix[y][x], x, y);
        }
    }
}
exports.matForEach = matForEach;
function matMap(matrix, fn) {
    var width = matWidth(matrix);
    var height = matHeight(matrix);
    return createMatrix(width, height, function (x, y) { return fn(matrix[y][x], x, y); });
}
exports.matMap = matMap;
function createArray(length, gen) {
    var result = Array(length);
    for (var i = 0; i < length; i++) {
        result[i] = gen(i);
    }
    return result;
}
exports.createArray = createArray;
function createMatrix(width, height, gen) {
    return createArray(height, function (y) { return createArray(width, function (x) { return gen(x, y); }); });
}
exports.createMatrix = createMatrix;
function matOp(mat1, mat2, fn) {
    if (typeof mat1 === 'number') {
        if (typeof mat2 === 'number')
            return [[fn(mat1, mat2)]];
        else
            return matMap(mat2, function (v) { return fn(mat1, v); });
    }
    else {
        if (typeof mat2 === 'number')
            return matMap(mat1, function (v) { return fn(v, mat2); });
        else
            return matMap(mat1, function (v, x, y) { return fn(v, mat2[y][x]); });
    }
}
exports.matOp = matOp;
function matOpExt(mat1, mat2, fn) {
    var width1 = matWidth(mat1);
    var height1 = matHeight(mat1);
    var width2 = matWidth(mat2);
    var height2 = matHeight(mat2);
    if (width1 < width2 || height1 < height2 || !(width2 === 1 || height1 === 1))
        throw new Error('Cannot op broadcast');
    var getValue2;
    if (width2 === 1) {
        if (height2 === 1) {
            getValue2 = function () { return matGet(mat2, 0, 0); };
        }
        else {
            getValue2 = function (x, y) { return matGet(mat2, 0, y); };
        }
    }
    else {
        if (height2 === 1) {
            getValue2 = function (x, y) { return matGet(mat2, x, 0); };
        }
        else {
            throw new Error('Cannot op broadcast');
        }
    }
    return matMap(mat1, function (value1, x, y) { return fn(value1, getValue2(x, y)); });
}
exports.matOpExt = matOpExt;
function matAdd(mat1, mat2) {
    return matOp(mat1, mat2, function (a, b) { return a + b; });
}
exports.matAdd = matAdd;
function matSub(mat1, mat2) {
    return matOp(mat1, mat2, function (a, b) { return a - b; });
}
exports.matSub = matSub;
function matMul(mat1, mat2) {
    return matOp(mat1, mat2, function (a, b) { return a * b; });
}
exports.matMul = matMul;
function matDiv(mat1, mat2) {
    return matOp(mat1, mat2, function (a, b) { return a / b; });
}
exports.matDiv = matDiv;
function matMod(mat1, mat2) {
    return matOp(mat1, mat2, function (a, b) { return a % b; });
}
exports.matMod = matMod;
function matPow(mat1, mat2) {
    return matOp(mat1, mat2, function (a, b) { return Math.pow(a, b); });
}
exports.matPow = matPow;
function matAddExt(mat1, mat2) {
    return matOpExt(mat1, mat2, function (a, b) { return a + b; });
}
exports.matAddExt = matAddExt;
function matSubExt(mat1, mat2) {
    return matOpExt(mat1, mat2, function (a, b) { return a - b; });
}
exports.matSubExt = matSubExt;
function matMulExt(mat1, mat2) {
    return matOpExt(mat1, mat2, function (a, b) { return a * b; });
}
exports.matMulExt = matMulExt;
function matDivExt(mat1, mat2) {
    return matOpExt(mat1, mat2, function (a, b) { return a / b; });
}
exports.matDivExt = matDivExt;
function matModExt(mat1, mat2) {
    return matOpExt(mat1, mat2, function (a, b) { return a % b; });
}
exports.matModExt = matModExt;
function matPowExt(mat1, mat2) {
    return matOpExt(mat1, mat2, function (a, b) { return Math.pow(a, b); });
}
exports.matPowExt = matPowExt;
function matDot(mat1, mat2) {
    var width1 = matWidth(mat1);
    var height1 = matHeight(mat1);
    var width2 = matWidth(mat2);
    var height2 = matHeight(mat2);
    if (width1 !== height2)
        throw new Error('Cannot dot');
    return createMatrix(width2, height1, function (x, y) { return arraySum(arrayZip(matRow(mat1, y), matCol(mat2, x), function (a, b) { return a * b; })); });
}
exports.matDot = matDot;
function matTranspose(mat) {
    var height = mat.length;
    var width = height > 0 ? mat[0].length : 0;
    return createMatrix(height, width, function (x, y) { return mat[x][y]; });
}
exports.matTranspose = matTranspose;
function isInRange(value, minInclusive, maxExclusive) {
    return value >= minInclusive && value < maxExclusive;
}
exports.isInRange = isInRange;
function matSlice(mat, sx, sy, width, height) {
    var endX = sx + width;
    var endY = sy + height;
    // sourceHeight sourceWidth
    var sw = matWidth(mat);
    var sh = matHeight(mat);
    if (!isInRange(sx, 0, sw) || !isInRange(sy, 0, sh) || !isInRange(endX - 1, 0, sw) || !isInRange(endY - 1, 0, sh))
        throw new Error("Cannot slice");
    return createMatrix(width, height, function (x, y) { return mat[sy + y][sx + x]; });
}
exports.matSlice = matSlice;
function matConcatHorizontal(mat1, mat2) {
    var width1 = matWidth(mat1);
    var height1 = matHeight(mat1);
    var width2 = matWidth(mat2);
    var height2 = matHeight(mat2);
    if (height1 !== height2)
        throw new Error('Cannot concat matrix with different height');
    return createMatrix(width1 + width2, height1, function (x, y) { return (x < width1 ? mat1[y][x] : mat2[y][x - width1]); });
}
exports.matConcatHorizontal = matConcatHorizontal;
function matWidth(mat) {
    return mat.length > 0 ? mat[0].length : 0;
}
exports.matWidth = matWidth;
function matHeight(mat) {
    return mat.length;
}
exports.matHeight = matHeight;
function matGet(mat, x, y) {
    if (!isInRange(x, 0, matWidth(mat)) || !isInRange(y, 0, matHeight(mat)))
        throw new Error('Index out of range');
    return mat[y][x];
}
exports.matGet = matGet;
function matSet(mat, x, y, value) {
    if (!isInRange(x, 0, matWidth(mat)) || !isInRange(y, 0, matHeight(mat)))
        throw new Error('Index out of range');
    return mat[y][x] = value;
}
exports.matSet = matSet;
function createMatrixFromArray(width, height, arr) {
    return createMatrix(width, height, function (x, y) { return arr[y * width + x] || 0; });
}
exports.createMatrixFromArray = createMatrixFromArray;
function matRow(mat, y) {
    return mat[y].slice();
}
exports.matRow = matRow;
function matCol(mat, x) {
    return mat.map(function (row) { return row[x]; });
}
exports.matCol = matCol;
function arraySum(arr) {
    return arr.reduce(function (a, b) { return a + b; }, 0);
}
exports.arraySum = arraySum;
function arrayZip(arr1, arr2, fn) {
    if (arr1.length !== arr2.length)
        throw new Error('Cannot zip with arrays with different length');
    return createArray(arr1.length, function (i) { return fn(arr1[i], arr2[i], i); });
}
exports.arrayZip = arrayZip;
function arrayPeek(arr) {
    return arr[arr.length - 1];
}
exports.arrayPeek = arrayPeek;
function rand(min, max) {
    return min + Math.random() * (max - min);
}
exports.rand = rand;
function randInt(min, max) {
    return Math.floor(min + Math.random() * (max - min));
}
exports.randInt = randInt;
//# sourceMappingURL=MathUtils.js.map