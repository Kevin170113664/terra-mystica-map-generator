export const terrainChangeCost = {
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
