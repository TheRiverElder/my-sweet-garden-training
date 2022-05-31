
export type Matrix = number[][];
export type MatrixOrNumber = Matrix | number;

// function synchromorphify(pattern: Matrix, num: number) {
//     const height = pattern.length;
//     const width = height > 0 ? pattern[0].length : 0;

// }

export function matForEach(matrix: Matrix, fn: (value: number, x: number, y: number) => void) {
    const width = matWidth(matrix);
    const height = matHeight(matrix);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            fn(matrix[y][x], x, y);
        }
    }
}

export function matMap(matrix: Matrix, fn: (value: number, x: number, y: number) => number): Matrix {
    const width = matWidth(matrix);
    const height = matHeight(matrix);
    return createMatrix(width, height, (x, y) => fn(matrix[y][x], x, y));
}

export function createArray<T>(length: number, gen: (index: number) => T): Array<T> {
    const result: Array<T> = Array(length);
    for (let i = 0; i < length; i++) {
        result[i] = gen(i);
    }
    return result;
}

export function createMatrix(width: number, height: number, gen: (x: number, y: number) => number): Matrix {
    return createArray(height, (y) => createArray(width, (x) => gen(x, y)));
}

export function matOp(mat1: MatrixOrNumber, mat2: MatrixOrNumber, fn: (value1: number, value2: number) => number): Matrix {
    if (typeof mat1 === 'number') {
        if (typeof mat2 === 'number') return [[fn(mat1, mat2)]];
        else return matMap(mat2, (v) => fn(mat1, v));
    } else {
        if (typeof mat2 === 'number') return matMap(mat1, (v) => fn(v, mat2));
        else return matMap(mat1, (v, x, y) => fn(v, mat2[y][x]));
    }
}

export function matOpExt(mat1: Matrix, mat2: Matrix, fn: (value1: number, value2: number) => number): Matrix {
    const width1 = matWidth(mat1);
    const height1 = matHeight(mat1);
    const width2 = matWidth(mat2);
    const height2 = matHeight(mat2);

    if (width1 < width2 || height1 < height2 || !(width2 === 1 || height1 === 1)) throw new Error('Cannot op broadcast');

    let getValue2: (x: number, y: number) => number;
    if (width2 === 1) {
        if (height2 === 1) {
            getValue2 = () => matGet(mat2, 0, 0);
        } else {
            getValue2 = (x, y) => matGet(mat2, 0, y);
        }
    } else {
        if (height2 === 1) {
            getValue2 = (x, y) => matGet(mat2, x, 0);
        } else {
            throw new Error('Cannot op broadcast');
        }
    }

    return matMap(mat1, (value1, x, y) => fn(value1, getValue2(x, y)));
}

export function matAdd(mat1: MatrixOrNumber, mat2: MatrixOrNumber): Matrix {
    return matOp(mat1, mat2, (a, b) => a + b);
}

export function matSub(mat1: MatrixOrNumber, mat2: MatrixOrNumber): Matrix {
    return matOp(mat1, mat2, (a, b) => a - b);
}

export function matMul(mat1: MatrixOrNumber, mat2: MatrixOrNumber): Matrix {
    return matOp(mat1, mat2, (a, b) => a * b);
}

export function matDiv(mat1: MatrixOrNumber, mat2: MatrixOrNumber): Matrix {
    return matOp(mat1, mat2, (a, b) => a / b);
}

export function matMod(mat1: Matrix, mat2: MatrixOrNumber): Matrix {
    return matOp(mat1, mat2, (a, b) => a % b);
}

export function matPow(mat1: Matrix, mat2: MatrixOrNumber): Matrix {
    return matOp(mat1, mat2, (a, b) => a ** b);
}

export function matAddExt(mat1: Matrix, mat2: Matrix): Matrix {
    return matOpExt(mat1, mat2, (a, b) => a + b);
}

export function matSubExt(mat1: Matrix, mat2: Matrix): Matrix {
    return matOpExt(mat1, mat2, (a, b) => a - b);
}

export function matMulExt(mat1: Matrix, mat2: Matrix): Matrix {
    return matOpExt(mat1, mat2, (a, b) => a * b);
}

export function matDivExt(mat1: Matrix, mat2: Matrix): Matrix {
    return matOpExt(mat1, mat2, (a, b) => a / b);
}

export function matModExt(mat1: Matrix, mat2: Matrix): Matrix {
    return matOpExt(mat1, mat2, (a, b) => a % b);
}

export function matPowExt(mat1: Matrix, mat2: Matrix): Matrix {
    return matOpExt(mat1, mat2, (a, b) => a ** b);
}

export function matDot(mat1: Matrix, mat2: Matrix): Matrix {
    const width1 = matWidth(mat1);
    const height1 = matHeight(mat1);
    const width2 = matWidth(mat2);
    const height2 = matHeight(mat2);

    if (width1 !== height2) throw new Error('Cannot dot');
    return createMatrix(width2, height1, (x, y) => arraySum(arrayZip(matRow(mat1, y), matCol(mat2, x), (a, b) => a * b)));
}

export function matTranspose(mat: Matrix): Matrix {
    const height = mat.length;
    const width = height > 0 ? mat[0].length : 0;
    return createMatrix(height, width, (x, y) => mat[x][y]);
}

export function isInRange(value: number, minInclusive: number, maxExclusive: number) {
    return value >= minInclusive && value < maxExclusive;
}

export function matSlice(mat: Matrix, sx: number, sy: number, width: number, height: number): Matrix {
    const endX = sx + width;
    const endY = sy + height;
    // sourceHeight sourceWidth
    const sw = matWidth(mat);
    const sh = matHeight(mat);
    if (!isInRange(sx, 0, sw) || !isInRange(sy, 0, sh) || !isInRange(endX - 1, 0, sw) || !isInRange(endY - 1, 0, sh)) throw new Error("Cannot slice");
    return createMatrix(width, height, (x, y) => mat[sy + y][sx + x]);
}

export function matConcatHorizontal(mat1: Matrix, mat2: Matrix): Matrix {
    const width1 = matWidth(mat1);
    const height1 = matHeight(mat1);
    const width2 = matWidth(mat2);
    const height2 = matHeight(mat2);

    if (height1 !== height2) throw new Error('Cannot concat matrix with different height');
    return createMatrix(width1 + width2, height1, (x, y) => (x < width1 ? mat1[y][x] : mat2[y][x - width1]));
}

export function matWidth(mat: Matrix): number {
    return mat.length > 0 ? mat[0].length : 0;
}

export function matHeight(mat: Matrix): number {
    return mat.length;
}

export function matGet(mat: Matrix, x: number, y: number): number {
    if (!isInRange(x, 0, matWidth(mat)) || !isInRange(y, 0, matHeight(mat))) throw new Error('Index out of range');
    return mat[y][x];
}

export function matSet(mat: Matrix, x: number, y: number, value: number): number {
    if (!isInRange(x, 0, matWidth(mat)) || !isInRange(y, 0, matHeight(mat))) throw new Error('Index out of range');
    return mat[y][x] = value;
}

export function createMatrixFromArray(width: number, height: number, arr: Array<number>): Matrix {
    return createMatrix(width, height, (x, y) => arr[y * width + x] || 0);
}

export function matRow(mat: Matrix, y: number): Array<number> {
    return mat[y].slice();
}

export function matCol(mat: Matrix, x: number): Array<number> {
    return mat.map((row) => row[x]);
}

export function arraySum(arr: Array<number>): number {
    return arr.reduce((a, b) => a + b, 0);
}

export function arrayZip<T1, T2, R>(arr1: Array<T1>, arr2: Array<T2>, fn: (value1: T1, value2: T2, index: number) => R): Array<R> {
    if (arr1.length !== arr2.length) throw new Error('Cannot zip with arrays with different length');
    return createArray(arr1.length, (i) => fn(arr1[i], arr2[i], i));
}

export function arrayPeek<T>(arr: Array<T>): T | undefined {
    return arr[arr.length - 1];
}

export function rand(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

export function randInt(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min));
}