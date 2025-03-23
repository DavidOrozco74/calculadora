import { useState, useEffect, useRef } from 'react';
import './style.css';

const BubbleComponent = ({ value, exitMultiple }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [bubbleSize, setBubbleSize] = useState(200);
  const [inflationProgress, setInflationProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Efecto para calcular el tamaño base de la burbuja según exitMultiple
  useEffect(() => {
    let size = 100;
    const baseValue = 10000000;
    if (exitMultiple < baseValue) {
      const diferencia = (baseValue - exitMultiple) / 1000000;
      size = 100 - diferencia * 0.9;
    } else {
      const millones = exitMultiple / 1000000;
      const decenasDeMillon = Math.floor(millones / 10);
      size = 100 + millones * 0.5 + decenasDeMillon * 1.5;
      if (exitMultiple > 200000000 && exitMultiple <= 230000000) {
        const exceso = (exitMultiple - 200000000) / 1000000;
        size += exceso * 0.2;
      }
    }
    setBubbleSize(Math.min(Math.max(10, size), 180));
  }, [exitMultiple]);

  // Configurar el observador de intersección para detectar cuando el componente es visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // Si el componente se vuelve visible y aún no ha comenzado la animación
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          // Iniciar la animación de inflado cuando se vuelve visible
          startInflationAnimation();
        }
      },
      {
        root: null, // viewport
        threshold: 0.3, // Cuando al menos el 30% del componente es visible
        rootMargin: '0px'
      }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => {
      if (componentRef.current) {
        observer.unobserve(componentRef.current);
      }
      // Limpiar cualquier animación pendiente
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Función para iniciar la animación de inflado con requestAnimationFrame
  const startInflationAnimation = () => {
    // Duración de la animación en milisegundos (2 segundos)
    const animationDuration = 1000;
    
    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      // Calcular el progreso de la animación (0 a 1)
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Actualizar el estado con el progreso actual
      setInflationProgress(progress);
      
      // Continuar la animación si no ha terminado
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Iniciar la animación
    animationRef.current = requestAnimationFrame(animate);
  };

  // Calcular el tamaño final del globo basado en el progreso de inflado
  const initialSizeFactor = 0.2; // Tamaño inicial pequeño
  const maxSizeFactor = 1; // Tamaño máximo final
  const currentSizeFactor = initialSizeFactor + (maxSizeFactor - initialSizeFactor) * inflationProgress;
  
  const finalBubbleSize = isVisible ? bubbleSize * currentSizeFactor : 0;
  const fontSize = `${Math.min(Math.max(1, finalBubbleSize / 50), finalBubbleSize / 10)}rem`;
  const hoverSize = finalBubbleSize * 1.2;

  return (
    <div ref={componentRef} className="w-full h-80 flex items-center justify-center">
      <div
        className="transition-transform duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          transform: isHovered ? `scale(${hoverSize / Math.max(1, finalBubbleSize)})` : 'scale(1)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-out'
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
          <circle
            cx="200"
            cy="200"
            r={Math.max(1, finalBubbleSize)}
            fill="#0057FF"
            stroke="#000000"
            strokeWidth="3"
            className="transition-all duration-500 ease-out"
          />
          <text
            x="200"
            y="200"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#fdfefe"
            fontSize={fontSize}
            fontWeight="bold"
            className="transition-all duration-500 ease-out"
          >
            {value}
          </text>
        </svg>
      </div>
    </div>
  );
};

export default BubbleComponent;