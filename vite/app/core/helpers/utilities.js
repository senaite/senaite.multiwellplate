// Recursive object traversal utility

function findObjectsByType(obj, selector, results = []) {
  // If obj is null or not an object, return
  if (obj === null || typeof obj !== 'object') {
    return results;
  }
  
  // Check if current object matches the selector
  let matches = false;
  
  if (typeof selector === 'function') {
    // Selector is a class constructor - check instanceof
    matches = obj instanceof selector;
  } else if (typeof selector === 'object') {
    // Selector is an object structure - check if obj has matching properties
    matches = Object.keys(selector).every(key => {
      if (typeof selector[key] === 'function') {
        // Property value is a type check function
        return key in obj && selector[key](obj[key]);
      } else {
        // Property value is an exact match
        return key in obj && obj[key] === selector[key];
      }
    });
  } else if (typeof selector === 'string') {
    // Selector is a constructor name string
    matches = obj.constructor && obj.constructor.name === selector;
  }
  
  if (matches) {
    results.push(obj);
  }
  
  // Traverse all properties
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      // Recursively search in nested objects/arrays
      if (typeof value === 'object' && value !== null) {
        findObjectsByType(value, selector, results);
      }
    }
  }
  
  return results;
}

function traverseObject(obj, callback) {
  for (const key in obj) {
    // Ensure the property belongs to the object and not its prototype
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      // Execute the callback for the current property
      callback(key, value, obj);

      // If the value is an object (and not null, which is typeof 'object'), recurse
      if (typeof value === 'object' && value !== null) {
        // Handle arrays by calling the function recursively on each element
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (typeof item === 'object' && item !== null) {
              traverseObject(item, callback);
            }
          });
        } else {
          // Recurse into the nested object
          traverseObject(value, callback);
        }
      }
    }
  }
}

// Functional composition utilities
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const partial = (fn, ...partials) => (...args) => {
  return fn(...partials, ...args);
};

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
    const colStart = r === targetRow ? targetCol : 1;
    for (let c = colStart; c <= colsCount; c++) {
      yield (r - 1) * colsCount + c;
    }
  }
}

function* columnOrderIndices({ targetRow, targetCol, rowsCount, colsCount }) {
  for (let c = targetCol; c <= colsCount; c++) {
    const rowStart = c === targetCol ? targetRow : 1;
    for (let r = rowStart; r <= rowsCount; r++) {
      yield (r - 1) * colsCount + c;
    }
  }
}

function* shiftOrderIndices({ targetRow, targetCol, initialRow, initialCol, rowsCount, colsCount }) {
  const rowShift = targetRow - (initialRow || 1);
  const colShift = targetCol - (initialCol || 1);
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
      if (typeof value === 'string' && value.toLowerCase().includes(searchText.toLowerCase())) {
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
  findObjectsByType,
  traverseObject,
  partial,
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