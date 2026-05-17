import { LuPackage, LuEgg } from "react-icons/lu";
import { BsGrid3X2 } from "react-icons/bs";

interface Props {
  totalPieces: number;
  className?: string;
}

export const EggQuantityDisplay: React.FC<Props> = ({
  totalPieces,
  className = "",
}) => {
  const boxes = Math.floor(totalPieces / 360);
  const remainingAfterBoxes = totalPieces % 360;
  const cartons = Math.floor(remainingAfterBoxes / 30);
  const pieces = remainingAfterBoxes % 30;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {boxes > 0 && (
        <div className="flex items-center gap-1 text-blue-400" title="Cajas">
          <LuPackage size={16} />
          <span className="font-bold">{boxes}</span>
        </div>
      )}

      {cartons > 0 && (
        <div
          className="flex items-center gap-1 text-purple-400"
          title="Casilleros"
        >
          <BsGrid3X2 size={16} />
          <span className="font-bold">{cartons}</span>
        </div>
      )}

      {(pieces > 0 || totalPieces === 0) && (
        <div className="flex items-center gap-1 text-amber-400" title="Piezas">
          <LuEgg size={16} />
          <span className="font-bold">{pieces}</span>
        </div>
      )}
    </div>
  );
};
