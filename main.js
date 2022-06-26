// https://eperezcosano.github.io/hex-grid/

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const a = 2 * Math.PI / 6;
const r = 50;

const allTerrainTypes = ['plain', 'swamp', 'lake', 'forest', 'mountain', 'wasteland', 'desert'];
const terrainChangeCost = {
  plain: {
    plain: 0,
    swamp: 1,
    lake: 2,
    forest: 3,
    mountain: 3,
    wasteland: 2,
    desert: 1,
  },
  swamp: {
    plain: 1,
    swamp: 0,
    lake: 1,
    forest: 2,
    mountain: 3,
    wasteland: 3,
    desert: 2
  },
  lake: {
    plain: 2,
    swamp: 1,
    lake: 0,
    forest: 1,
    mountain: 2,
    wasteland: 3,
    desert: 3
  },
  forest: {
    plain: 3,
    swamp: 2,
    lake: 1,
    forest: 0,
    mountain: 1,
    wasteland: 2,
    desert: 3
  },
  mountain: {
    plain: 3,
    swamp: 3,
    lake: 2,
    forest: 1,
    mountain: 0,
    wasteland: 1,
    desert: 2
  },
  wasteland: {
    plain: 2,
    swamp: 3,
    lake: 3,
    forest: 2,
    mountain: 1,
    wasteland: 0,
    desert: 1
  },
  desert: {
    plain: 1,
    swamp: 2,
    lake: 3,
    forest: 3,
    mountain: 2,
    wasteland: 1,
    desert: 0,
  },
};
const color = {
  plain: 'rgba(77,0,17,0)',
  swamp: 'rgba(10,0,0,0)',
  lake: 'rgba(24,57,234,0)',
  forest: 'rgba(29,159,20,0)',
  mountain: 'rgba(143,140,140,0)',
  wasteland: 'rgba(204,5,27,0)',
  desert: 'rgba(234,200,28,0)',
  river: 'rgba(28,228,234,0)'
};
const img = {
  plain: document.getElementById("plain"),
  swamp: document.getElementById("swamp"),
  lake: document.getElementById("lake"),
  forest: document.getElementById("forest"),
  mountain: document.getElementById("mountain"),
  wasteland: document.getElementById("wasteland"),
  desert: document.getElementById("desert"),
  river: document.getElementById("river"),
}

//列数总应该是奇数
const five_playes = [10, 15];
const four_playes = [9, 13];
const three_playes = [6, 11];
const [rows, columns] = four_playes;
const maxRiverTiles = Math.floor(rows * columns * 0.31); // 把最大合流比例定为31%

let terrainMap = [];
let riverTiles = 0;
let tileStatistics = {
  plain: 0,
  swamp: 0,
  lake: 0,
  forest: 0,
  mountain: 0,
  wasteland: 0,
  desert: 0,
  totalTiles: rows * columns
}

function init() {
  initTerrainMap();
  initRivers();
  initRivers();
  initRivers();
  initTerrains();

  canvas.height = (rows - 1) * 100 + r;
  canvas.width = Math.ceil(columns / 2) * 150;
  drawGrid(canvas.width, canvas.height);
}

function drawGrid(width, height) {
  for (let y = r; y + r * Math.sin(a) < height; y += r * Math.sin(a)) {
    for (let x = r, j = 0; x + r * (1 + Math.cos(a)) < width; x += r * (1 + Math.cos(a)), y += (-1) ** j++ * r * Math.sin(a)) {
      drawHexagon(x, y);
    }
  }
}

function drawHexagon(x, y) {
  const [coordinateX, coordinateY] = [Math.floor(x / 75), Math.floor(Math.max((y - r), 0) / 42.5)]
  const coordinatesText = `${ coordinateX }, ${ coordinateY }`;

  const hexagon = new Path2D();
  hexagon.moveTo(x + r * Math.cos(a), y - r * Math.sin(a));
  for (let i = 0; i < 6; i++) {
    hexagon.lineTo(x + r * Math.cos(a * i), y + r * Math.sin(a * i));
  }
  hexagon.closePath();

  ctx.fillStyle = 'white';
  if (terrainMap[coordinateX] && terrainMap[coordinateX][coordinateToIndex(coordinateY)]) {
    const terrainType = colorToTerrainType(terrainMap[coordinateX][coordinateToIndex(coordinateY)]);
    const image = img[terrainType];
    ctx.drawImage(image, x - 0.75 * r, y - 0.75 * r, image.width, image.height);
    ctx.fillStyle = terrainMap[coordinateX][coordinateToIndex(coordinateY)];
  }
  ctx.fill(hexagon);
  // ctx.fillStyle = 'black';
  // ctx.fillText(coordinatesText, x - 7.5, y + 5, 30);
}

function initTerrainMap() {
  terrainMap = [];
  const [rows, columns] = four_playes;
  for (let col = 0; col < columns; col++) {
    terrainMap.push([])
    for (let row = 0; row < rows; row++) {
      terrainMap[col].push(null)
    }
  }
}

function initRivers() {
  const randomEdgeTile = [0, getRandomEvenNumber(Math.floor(2 * rows) - 1)];
  let [x, y] = randomEdgeTile;
  terrainMap[x][coordinateToIndex(y)] = color.river;
  let maxIterateCount = 999;
  while (true) {
    const [nextX, nextY] = moveToNextRiverTile([x, y])
    if (maxIterateCount === 0 || !isAvailableCoordinate(moveToNextRiverTile([x, y])) || reachMaxRiverTiles()) {
      break;
    }
    terrainMap[nextX][coordinateToIndex(nextY)] = color.river;
    riverTiles += 1;
    x = nextX;
    y = nextY;
    maxIterateCount--;
  }
}

function reachMaxRiverTiles() {
  let currentRiverTiles = 0;
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (terrainMap[i][j] === color.river) {
        currentRiverTiles += 1;
      }
    }
  }
  return currentRiverTiles >= maxRiverTiles;
}

function isAvailableCoordinate([x, y]) {
  return x >= 0 && y >= 0 && x < columns && y < 2 * rows;
}

function moveToNextRiverTile([x, y]) {
  const nextTiles = [[x + 1, y - 1], [x + 1, y + 1]];
  const availableTiles = [];
  for (let i = 0; i < nextTiles.length; i++) {
    const [potentialX, potentialY] = nextTiles[i];
    if (isAvailableCoordinate([potentialX, potentialY])
      && (terrainMap[potentialX] && terrainMap[potentialX][coordinateToIndex(potentialY)] !== color.river)) {
      availableTiles.push(nextTiles[i]);
    }
  }
  return availableTiles[getRandomNumber(availableTiles.length)] || [-1, -1];
}

function getRandomNumber(max) {
  return Math.floor(Math.random() * max);
}

function getRandomEvenNumber(max) {
  return Math.floor(Math.random() * max / 2) * 2
}

function initTerrains() {

  const totalTiles = rows * columns;
  let availableTiles = {
    plain: 0,
    swamp: 0,
    lake: 0,
    forest: 0,
    mountain: 0,
    wasteland: 0,
    desert: 0,
  }
  const avgAvailableTiles = Math.ceil((totalTiles - riverTiles) / 7);
  availableTiles.plain = avgAvailableTiles;
  availableTiles.swamp = avgAvailableTiles;
  availableTiles.lake = avgAvailableTiles;
  availableTiles.forest = avgAvailableTiles;
  availableTiles.mountain = avgAvailableTiles;
  availableTiles.wasteland = avgAvailableTiles;
  availableTiles.desert = avgAvailableTiles;

  function getTerrainColor([x, y]) {
    let availableTerrainTypes = allTerrainTypes.map(terrainType => ({ terrainType, cost: 0 }));
    const neighborTiles = [[x - 1, y - 1], [x - 1, y + 1], [x, y - 2], [x, y + 2], [x + 1, y - 1], [x + 1, y + 1]];

    neighborTiles.forEach(([neighborX, neighborY]) => {
      if (isAvailableCoordinate([neighborX, neighborY])
        && terrainMap[neighborX][coordinateToIndex(neighborY)]
        && terrainMap[neighborX][coordinateToIndex(neighborY)] !== color.river) {
        const neighborTerrainType = colorToTerrainType(terrainMap[neighborX][coordinateToIndex(neighborY)]);
        availableTerrainTypes = availableTerrainTypes.filter(({ terrainType }) => terrainType !== neighborTerrainType)
        availableTerrainTypes = availableTerrainTypes.map(({ terrainType, cost }) => ({
          terrainType,
          cost: cost + terrainChangeCost[neighborTerrainType][terrainType]
        }))
      }
    })

    availableTerrainTypes = availableTerrainTypes.filter(({ terrainType }) => availableTiles[terrainType] > 0)
    // availableTerrainTypes = availableTerrainTypes.sort(({ cost: a }, { cost: b }) => a < b ? 1 : -1)
    // availableTerrainTypes = availableTerrainTypes.sort(({ terrainType: a }, { terrainType: b }) => availableTiles[a] > availableTiles[b] ? 1 : -1)
    if (availableTerrainTypes.length === 0) {
      return null;
    }

    const { terrainType } = availableTerrainTypes[getRandomNumber(availableTerrainTypes.length)];
    availableTiles[terrainType] -= 1;
    tileStatistics[terrainType] += 1;
    return color[terrainType];
  }

  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < rows; row++) {
      if (terrainMap[col][row] !== color.river) {
        terrainMap[col][row] = getTerrainColor([col, indexToCoordinate(col, row)]);
      }
    }
  }
  console.log('Tiles Statistics', JSON.stringify({ ...tileStatistics }, null, 2));
}

function colorToTerrainType(colorRGB) {
  let terrainType;
  Object.entries(color).forEach(([key, value]) => {
    if (value === colorRGB) {
      terrainType = key;
    }
  })
  return terrainType;
}

function coordinateToIndex(y) {
  return (y - y % 2) / 2;
}

function indexToCoordinate(x, y) {
  return y * 2 + x % 2;
}

init();