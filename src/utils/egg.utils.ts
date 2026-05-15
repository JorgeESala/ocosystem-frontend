export const calculateEggUnits = (totalPieces: number) => {
  const boxes = Math.floor(totalPieces / 360);
  const remainingAfterBoxes = totalPieces % 360;
  const cartons = Math.floor(remainingAfterBoxes / 30);
  const pieces = remainingAfterBoxes % 30;

  return { boxes, cartons, pieces };
};
