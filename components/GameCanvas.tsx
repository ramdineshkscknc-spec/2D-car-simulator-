
import React, { useRef, useEffect, useCallback } from 'react';
import { Car, Vector2 } from '../types';
import { PHYSICS, COLORS, TRACK_SIZE } from '../constants';

interface GameCanvasProps {
  car: Car;
  setCar: React.Dispatch<React.SetStateAction<Car>>;
  onCrash: (damage: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ car, setCar, onCrash }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef<Record<string, boolean>>({});
  const carRef = useRef<Car>(car);

  // Sync ref with prop
  useEffect(() => {
    carRef.current = car;
  }, [car]);

  // Handle Inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const updatePhysics = useCallback(() => {
    const c = { ...carRef.current };
    
    // 1. Inputs & Acceleration
    let targetAcceleration = 0;
    if (keys.current['w'] || keys.current['arrowup']) targetAcceleration = PHYSICS.ACCELERATION;
    if (keys.current['s'] || keys.current['arrowdown']) targetAcceleration = -PHYSICS.ACCELERATION / 2;
    
    // Steering
    let targetSteering = 0;
    // Steering is more effective at medium speeds, less at 0 or max
    const steerFactor = Math.min(Math.abs(c.speed) / PHYSICS.MIN_STEER_SPEED, 1.0);
    if (keys.current['a'] || keys.current['arrowleft']) targetSteering = -PHYSICS.STEER_SPEED * steerFactor;
    if (keys.current['d'] || keys.current['arrowright']) targetSteering = PHYSICS.STEER_SPEED * steerFactor;

    // Apply handbrake
    if (keys.current[' ']) {
      c.velocity.x *= 0.95;
      c.velocity.y *= 0.95;
      targetAcceleration = 0;
    }

    // 2. Physics calculations
    c.angle += targetSteering;
    
    // Convert angle to directional vector
    const dirX = Math.cos(c.angle);
    const dirY = Math.sin(c.angle);

    // Apply acceleration
    c.velocity.x += dirX * targetAcceleration;
    c.velocity.y += dirY * targetAcceleration;

    // Apply Friction and Drag
    c.velocity.x *= PHYSICS.FRICTION;
    c.velocity.y *= PHYSICS.FRICTION;

    // Calculate Speed
    c.speed = Math.sqrt(c.velocity.x ** 2 + c.velocity.y ** 2);
    if (c.speed > PHYSICS.MAX_SPEED) {
      const ratio = PHYSICS.MAX_SPEED / c.speed;
      c.velocity.x *= ratio;
      c.velocity.y *= ratio;
      c.speed = PHYSICS.MAX_SPEED;
    }

    // Update position
    c.pos.x += c.velocity.x;
    c.pos.y += c.velocity.y;

    // Boundary check & Pseudo-collisions (bouncing off world edge)
    if (c.pos.x < 100 || c.pos.x > TRACK_SIZE - 100 || c.pos.y < 100 || c.pos.y > TRACK_SIZE - 100) {
        if (c.speed > 2) {
            onCrash(c.speed * 2);
            c.velocity.x *= -0.5;
            c.velocity.y *= -0.5;
        }
    }

    // Clamp position
    c.pos.x = Math.max(0, Math.min(c.pos.x, TRACK_SIZE));
    c.pos.y = Math.max(0, Math.min(c.pos.y, TRACK_SIZE));

    carRef.current = c;
    setCar(c);
  }, [setCar, onCrash]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const c = carRef.current;
    const { width, height } = ctx.canvas;

    // Clear
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, width, height);

    // Camera following
    ctx.save();
    ctx.translate(width / 2 - c.pos.x, height / 2 - c.pos.y);

    // Draw Map (Grid for reference)
    ctx.strokeStyle = '#1a1a1e';
    ctx.lineWidth = 1;
    const gridSize = 200;
    for (let x = 0; x <= TRACK_SIZE; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, TRACK_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= TRACK_SIZE; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(TRACK_SIZE, y);
      ctx.stroke();
    }

    // Draw World Borders
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 20;
    ctx.strokeRect(0, 0, TRACK_SIZE, TRACK_SIZE);

    // Draw Simple Buildings/Obstacles
    ctx.fillStyle = '#111827';
    const obstacles = [
        {x: 500, y: 500, w: 200, h: 200},
        {x: 1500, y: 800, w: 300, h: 100},
        {x: 1000, y: 2500, w: 150, h: 400},
        {x: 3000, y: 3000, w: 500, h: 200},
        {x: 2500, y: 1500, w: 200, h: 200},
    ];
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = '#1f2937';
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    });

    // Draw Car
    ctx.save();
    ctx.translate(c.pos.x, c.pos.y);
    ctx.rotate(c.angle);
    
    // Body
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.roundRect(-PHYSICS.CAR_LENGTH/2, -PHYSICS.CAR_WIDTH/2, PHYSICS.CAR_LENGTH, PHYSICS.CAR_WIDTH, 5);
    ctx.fill();

    // Windows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, -PHYSICS.CAR_WIDTH/2 + 4, 15, PHYSICS.CAR_WIDTH - 8); // Windshield
    ctx.fillRect(-15, -PHYSICS.CAR_WIDTH/2 + 4, 10, PHYSICS.CAR_WIDTH - 8); // Rear

    // Headlights (Neon effect)
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'white';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(PHYSICS.CAR_LENGTH/2 - 2, -PHYSICS.CAR_WIDTH/2 + 5, 4, 6);
    ctx.fillRect(PHYSICS.CAR_LENGTH/2 - 2, PHYSICS.CAR_WIDTH/2 - 11, 4, 6);

    // Taillights
    ctx.shadowColor = 'red';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.fillRect(-PHYSICS.CAR_LENGTH/2 - 2, -PHYSICS.CAR_WIDTH/2 + 5, 4, 6);
    ctx.fillRect(-PHYSICS.CAR_LENGTH/2 - 2, PHYSICS.CAR_WIDTH/2 - 11, 4, 6);

    ctx.restore();
    ctx.restore();
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        updatePhysics();
        draw(ctx);
      }
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [updatePhysics, draw]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full cursor-none"
    />
  );
};

export default GameCanvas;
