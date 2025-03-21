import { useState, useEffect } from 'react';
import './style.css';

const BubbleComponent = ({ value, exitMultiple }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [bubbleSize, setBubbleSize] = useState(200);

  useEffect(() => {
    let size = 100; 
    const baseValue = 10000000; 

    if (exitMultiple < baseValue) {
      const diferencia = (baseValue - exitMultiple) / 1000000;
      size = 100 - (diferencia * 0.9);
    } else {
      const millones = exitMultiple / 1000000;
      const decenasDeMillon = Math.floor(millones / 10);
      size = 100 + millones * 0.5 + decenasDeMillon * 1.5;

      if (exitMultiple > 200000000 && exitMultiple <= 230000000) {
        const exceso = (exitMultiple - 200000000) / 1000000;
        size += exceso * 0.2; // Incremento adicional de 0.2 por cada millón después de 200M
      }
    }

    setBubbleSize(Math.min(Math.max(10, size), 180)); // Tamaño máximo ajustado a 180 para evitar cortes // Tamaño limitado estrictamente entre 10 y 230 // Tamaño limitado entre 10 y 230 // Tamaño máximo de 230 // Tamaño máximo de 220 // Tamaño mínimo de 10
  }, [exitMultiple]);

  const fontSize = `${Math.min(Math.max(1, bubbleSize / 50), bubbleSize / 10)}rem`; // Tamaño de fuente limitado para no salir del círculo
  const hoverSize = bubbleSize * 1.2;

  return (
    <div className="w-full h-80 flex items-center justify-center">
      <div
        className="transition-transform duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ transform: isHovered ? `scale(${hoverSize / bubbleSize})` : 'scale(1)' }}
      >
        <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
          <circle
            cx="200"
            cy="200"
            r={bubbleSize}
            fill="#0057FF"
            stroke="#000000"
            strokeWidth="3"
            className="transition-all duration-300 ease-in-out"
          />
          <text
            x="200"
            y="200"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#fdfefe"
            fontSize={fontSize}
            fontWeight="bold"
          >
            {value}
          </text>
        </svg>
      </div>
    </div>
  );
};

export default BubbleComponent;

