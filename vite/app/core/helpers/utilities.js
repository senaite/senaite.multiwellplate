
// Functional composition utilities
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const map = (fn) => function* (iterable) {
  for (const item of iterable) {
    yield fn(item);
  }
};

const filter = (predicate) => function* (iterable) {
  for (const item of iterable) {
    if (predicate(item)) yield item;
  }
};

const take = (n) => function* (iterable) {
  let count = 0;
  for (const item of iterable) {
    if (count++ >= n) break;
    yield item;
  }
};

const toArray = (iterable) => Array.from(iterable);

const coordsToIndex = ({ row, col, rowsCount, colsCount }) =>
  (row - 1) * colsCount + col;

const indexToCoords = (index, rowsCount, colsCount) => ({
  row: Math.floor((index - 1) / colsCount) + 1,
  col: index % colsCount
});

// Generator functions for iteration sequences
function* rowOrderIndices({ targetRow, targetCol, rowsCount, colsCount }) {
  for (let r = targetRow; r <= rowsCount; r++) {
    const colStart = r === targetRow ? targetCol : 0;
    for (let c = colStart; c <= colsCount; c++) {
      yield (r - 1) * colsCount + c;
    }
  }
}

function* columnOrderIndices({ targetRow, targetCol, rowsCount, colsCount }) {
  for (let c = targetCol; c <= colsCount; c++) {
    const rowStart = c === targetCol ? targetRow : 0;
    for (let r = rowStart; r <= rowsCount; r++) {
      yield (r - 1) * colsCount + c;
    }
  }
}

function* shiftOrderIndices({ targetRow, targetCol, initialRow, initialCol, rowsCount, colsCount }) {
  const rowShift = targetRow - (initialRow || 0);
  const colShift = targetCol - (initialCol || 0);
  const totalShift = rowShift * colsCount + colShift;
  // const startIdx = (initialRow + rowShift - 1) * colsCount + initialCol + colShift;
  const endIdx = rowsCount * colsCount;

  const startIdx = yield;
  let currentWellIdx = startIdx;
  for (let idx = startIdx + totalShift; idx <= endIdx; idx++) {
    yield currentWellIdx + totalShift
    let nextWellIdx = yield;
    currentWellIdx = currentWellIdx === nextWellIdx ? currentWellIdx + 1 : nextWellIdx;
    // If out of bounds, try to shift to next row/column
    // if (newCol > colsCount) {
    //   newRow += Math.floor((newCol - 1) / colsCount);
    //   newCol = ((newCol - 1) % colsCount) + 1;
    // } else if (newCol < 1) {
    //   const colDeficit = 1 - newCol;
    //   newRow -= Math.ceil(colDeficit / colsCount);
    //   newCol = colsCount - ((colDeficit - 1) % colsCount);
    // }
  }
}

function searchTextInObjectValues(obj, searchText) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'string' && value.includes(searchText)) {
        return true;
      }
      // If you need to search in nested objects, you would add recursion here
      // if (typeof value === 'object' && value !== null) {
      //   if (searchTextInObjectValues(value, searchText)) {
      //     return true;
      //   }
      // }
    }
  }
  return false; // Text not found in any value
}

export {
  pipe,
  map,
  filter,
  take,
  toArray,
  coordsToIndex,
  indexToCoords,
  shiftOrderIndices,
  columnOrderIndices,
  rowOrderIndices,
  searchTextInObjectValues
};