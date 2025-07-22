import React, { useEffect, useState } from 'react';
import './styles.css';

export namespace Confetti {
  export type Props = {
    active: boolean;
  }
}

export function Confetti(props: Confetti.Props) {
  /**
   * State vars
   */
  const [confettiElements, setConfettiElements] = useState<React.ReactNode[]>([]);
  
  /**
   * Side effects
   */
  useEffect(() => {
    if (props.active) {
      const elements: React.ReactNode[] = [];
      const colors = [
        '#FF3855', '#FD5B78', '#FF6037', '#FF9966', '#FF9933', 
        '#FFCC33', '#FFFF66', '#CCFF00', '#66FF66', '#AAF0D1',
        '#50BFE6', '#FF6EFF', '#EE34D2', '#FF00CC', '#FF00CC',
        '#9C51B6', '#A0D6B4', '#00FFFF', '#5946B2', '#E936A7'
      ];
      
      // Create multiple confetti elements - significantly increased for better coverage
      for (let i = 0; i < 500; i++) {
        // More consistent distance from center for smoother animation
        // Use linear distribution instead of tiered distances
        const minDistance = 100;
        const maxDistance = 800;
        const distance = minDistance + Math.random() * (maxDistance - minDistance);
        const angle = Math.random() * 360; // Angle in degrees
        const randomX = distance * Math.cos(angle * Math.PI / 180);
        const randomY = distance * Math.sin(angle * Math.PI / 180);
        
        // Slightly reduced random delay range for more simultaneous movement
        const animationDelay = `${Math.random() * 0.2}s`;
        const randomSpeed = Math.random();
        
        // Mostly smaller confetti pieces with occasional larger ones
        const sizes = [
          Math.floor(Math.random() * 6) + 4,     // Small: 4-10px (70% chance)
          Math.floor(Math.random() * 10) + 8,    // Medium: 8-18px (25% chance)
          Math.floor(Math.random() * 12) + 15    // Large: 15-27px (5% chance)
        ];
        const sizeRoll = Math.random();
        const size = sizeRoll < 0.7 ? sizes[0] : (sizeRoll < 0.95 ? sizes[1] : sizes[2]);
        
        // Random rotation
        const rotateAmount = -180 + Math.random() * 360;
        
        // Random color from our expanded palette
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Random shape - with more varieties
        const shapeTypes = ['square', 'circle', 'triangle', 'star', 'heart'];
        const shape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        
        // Set CSS variables for the explosion effect
        const style: React.CSSProperties = {
          '--random-x': `${randomX}px`,
          '--random-y': `${randomY}px`,
          '--random-rotate': `${rotateAmount}deg`,
          '--random-speed': randomSpeed.toString(),
          backgroundColor: color,
          width: `${size}px`,
          height: `${size}px`,
          animationDelay,
        } as React.CSSProperties;
        
        // For triangle and heart shapes
        if (shape === 'triangle') {
          style['--triangle-color'] = color;
          style.backgroundColor = 'transparent';
        } else if (shape === 'heart') {
          style['--heart-color'] = color;
          style.backgroundColor = 'transparent';
        }
        
        elements.push(
          <div
            key={i}
            className={`confetti-piece ${shape}`}
            style={style}
          />
        );
      }
      
      setConfettiElements(elements);
      
      // Clean up after animation ends
      const timer = setTimeout(() => {
        setConfettiElements([]);
      }, 3500); // Adjusted for smoother animation duration
      
      return () => {
        clearTimeout(timer);
      };
    } else {
      setConfettiElements([]);
    }
  }, [props.active]);
  
  /**
   * Render
   */
  if (!props.active && confettiElements.length === 0) {
    return null;
  }
  
  return (
    <div className="confetti-container">
      {confettiElements}
    </div>
  );
}