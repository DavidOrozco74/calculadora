import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const FounderProfitChart = ({ barra1, barra2, barra3, barra4, iconResta, simboly1, simboly2 }) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // Función para formatear moneda
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  // Efecto para actualizar el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calcula tamaños responsivos basados en el ancho de la pantalla
  const isMobile = windowSize.width < 768;
  const fontSize = isMobile ? 10 : 12;
  const barSize = isMobile ? 30 : 80;
  const symbolSize = isMobile ? 16 : 24;
  const percentSize = isMobile ? 14 : 20;
  
  // Ajuste de márgenes para dispositivos móviles
  const margins = isMobile 
    ? { top: 20, right: 10, left: 10, bottom: 80 } 
    : { top: 20, right: 20, left: 20, bottom: 60 };

  return (
    <div className="w-full h-72 md:h-80 lg:h-96 relative">
      <h3 className="text-center font-bold text-sm md:text-base lg:text-lg mb-2">
        Founder Profit at Exit with Debt
      </h3>
      
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={[
            ...barra1,
            ...iconResta,
            ...barra2,
            ...simboly1,
            ...barra3,
            ...simboly2,
            ...barra4,
          ]}
          margin={margins}
        >
          <XAxis
            dataKey="name"
            height={isMobile ? 70 : 60}
            tick={({ x, y, payload }) => {
              const lines = payload.value.split("\n");
              // Ajuste de posición para móviles
              const yOffset = isMobile ? 5 : 10;
              const lineHeight = isMobile ? 12 : 14;
              
              return (
                <text 
                  x={x} 
                  y={y + yOffset} 
                  textAnchor="middle" 
                  fill="#666" 
                  fontSize={fontSize}
                  fontWeight="normal"
                >
                  {lines.map((line, index) => (
                    <tspan 
                      key={index} 
                      x={x} 
                      dy={index === 0 ? 0 : lineHeight}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              );
            }}
          />
          
          <YAxis
            hide={false}
            domain={[0, (dataMax) => dataMax * 1.2]}
            tick={({ x, y, payload }) => {
              // Solo mostrar un par de valores en el eje Y
              if (payload.value === 0 || payload.value === Math.round(payload.value)) {
                return (
                  <text 
                    x={x} 
                    y={y} 
                    textAnchor="end" 
                    fill="#666" 
                    fontSize={fontSize}
                  >
                    {formatCurrency(payload.value)}
                  </text>
                );
              }
              return null;
            }}
            width={isMobile ? 40 : 60}
          />
          
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;

              const name = payload[0].payload.name;

              // Verifica si el nombre pertenece a simboly1, simboly2, iconResta o barra3
              const isDisabledData =
                simboly1.some((item) => item.name === name) ||
                simboly2.some((item) => item.name === name) ||
                iconResta.some((item) => item.name === name) ||
                barra3.some((item) => item.name === name);

              if (isDisabledData) {
                return null;
              }

              return (
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "8px",
                    border: "1px solid #ccc",
                    fontSize: isMobile ? 12 : 14,
                    borderRadius: "4px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  <p className="font-medium">{name}</p>
                  <p>{formatCurrency(payload[0].value)}</p>
                </div>
              );
            }}
            wrapperStyle={{ zIndex: 100 }}
          />
          
          <Bar
            dataKey={(dataPoint) => {
              // Si es un dato de porcentaje, retornamos 0 para que no se dibuje la barra
              return dataPoint && dataPoint.isPercentage
                ? 0
                : dataPoint
                ? dataPoint.value
                : 0;
            }}
            fill={"#0057FF"}
            stroke="none"
            barSize={barSize}
            label={(props) => {
              if (!props || !props.name) return <text />;

              const { x, y, width, value, name, payload } = props;

              // Verificar si es un símbolo
              const isSymbol =
                simboly1.some((item) => item.name === name) ||
                simboly2.some((item) => item.name === name) ||
                iconResta.some((item) => item.name === name);

              // Verificar si es un porcentaje
              const isPercentage =
                payload?.isPercentage ||
                barra3.some((item) => item.name === name);

              if (isPercentage) {
                const adjustedX = x + width / 2;
                // Asegúrate de que el porcentaje sea visible ajustando la posición Y
                const adjustedY = isMobile ? y - 10 : y - 20;

                return (
                  <text
                    x={adjustedX}
                    y={adjustedY}
                    fill="#333333"
                    textAnchor="middle"
                    fontSize={percentSize}
                    fontWeight="bold"
                  >
                    {`${value}%`}
                  </text>
                );
              } else if (isSymbol) {
                const adjustedX = x + width / 2;
                // Ajustar la posición Y para los símbolos
                const adjustedY = isMobile ? y : y - 15;

                return (
                  <text
                    x={adjustedX}
                    y={adjustedY}
                    fill="#555555"
                    textAnchor="middle"
                    fontSize={symbolSize}
                    fontWeight="bold"
                  >
                    {name}
                  </text>
                );
              }

              // Para los valores normales de las barras
              return (
                <text
                  x={x + width / 2}
                  y={y - (isMobile ? 5 : 10)}
                  fill="#333"
                  textAnchor="middle"
                  fontSize={isMobile ? 12 : 15}
                  fontWeight="bold"
                >
                  {formatCurrency(value)}
                </text>
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FounderProfitChart;