export const formatEggQuantity = (totalPieces: number): string => {
  const boxes = Math.floor(totalPieces / 360);
  const remainingAfterBoxes = totalPieces % 360;
  const cartons = Math.floor(remainingAfterBoxes / 30);
  const pieces = remainingAfterBoxes % 30;

  const parts = [];
  if (boxes > 0) parts.push(`${boxes}c`);
  if (cartons > 0) parts.push(`${cartons}cs`);
  if (pieces > 0 || parts.length === 0) parts.push(`${pieces}p`);

  return parts.join(", ");
};
