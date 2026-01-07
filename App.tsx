
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Car, Mission, Vector2 } from './types';
import { PHYSICS, COLORS } from './constants';
import GameCanvas from './components/GameCanvas';
import Dashboard from './components/Dashboard';
import { generateMission } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [mission, setMission] = useState<Mission | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [car, setCar] = useState<Car>({
    pos: { x: 500, y: 500 },
    velocity: { x: 0, y: 0 },
    acceleration: 0,
    angle: 0,
    steering: 0,
    speed: 0,
    health: 100,
    color: COLORS.PRIMARY,
  });

  const [stats, setStats] = useState({ avgSpeed: 0, crashes: 0 });

  // Handle mission generation
  const handleStartMission = async () => {
    setLoading(true);
    const newMission = await generateMission(stats);
    setMission(newMission);
    setTimeLeft(newMission.timeLimit);
    setCar({
      pos: { x: 2000, y: 2000 },
      velocity: { x: 0, y: 0 },
      acceleration: 0,
      angle: 0,
      steering: 0,
      speed: 0,
      health: 100,
      color: COLORS.PRIMARY,
    });
    setGameState(GameState.PLAYING);
    setLoading(false);
  };

  const handleFreeRoam = () => {
    setMission(null);
    setCar({
      pos: { x: 2000, y: 2000 },
      velocity: { x: 0, y: 0 },
      acceleration: 0,
      angle: 0,
      steering: 0,
      speed: 0,
      health: 100,
      color: COLORS.SECONDARY,
    });
    setGameState(GameState.PLAYING);
  };

  const updateStats = useCallback((finalCar: Car) => {
      // Very simple stats update
      setStats(prev => ({
          avgSpeed: (prev.avgSpeed + finalCar.speed) / 2,
          crashes: prev.crashes + (finalCar.health < 100 ? 1 : 0)
      }));
  }, []);

  const handleGameOver = useCallback((reason: string) => {
    updateStats(car);
    setGameState(GameState.GAMEOVER);
  }, [car, updateStats]);

  useEffect(() => {
    let timer: number;
    if (gameState === GameState.PLAYING && mission && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            handleGameOver("Time's Up!");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, mission, timeLeft, handleGameOver]);

  return (
    <div className="relative w-screen h-screen bg-[#0a0a0c] overflow-hidden">
      {gameState === GameState.MENU && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center mb-12">
            <h1 className="text-7xl font-orbitron font-bold tracking-tighter text-white mb-2 italic">
              NITRO<span className="text-blue-500">PULSE</span>
            </h1>
            <p className="text-gray-400 tracking-[0.3em] uppercase text-sm">2D Driving Simulator</p>
          </div>

          <div className="flex flex-col space-y-4 w-64">
            <button 
              onClick={handleStartMission}
              disabled={loading}
              className="group relative px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-orbitron rounded-lg transition-all overflow-hidden disabled:opacity-50"
            >
              <div className="relative z-10">{loading ? 'GENERATING MISSION...' : 'START MISSION'}</div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>

            <button 
              onClick={handleFreeRoam}
              className="px-6 py-4 border border-white/20 hover:bg-white/10 text-white font-orbitron rounded-lg transition-all"
            >
              FREE ROAM
            </button>
          </div>

          <div className="mt-20 flex space-x-12 text-center text-xs text-gray-500 uppercase tracking-widest font-bold">
            <div>WASD / ARROWS TO DRIVE</div>
            <div>SPACE TO HANDBRAKE</div>
            <div>R TO RESTART</div>
          </div>
        </div>
      )}

      {gameState === GameState.PLAYING && (
        <>
          <Dashboard 
            car={car} 
            mission={mission} 
            timeLeft={timeLeft} 
            onBack={() => setGameState(GameState.MENU)} 
          />
          <GameCanvas 
            car={car} 
            setCar={setCar} 
            onCrash={(damage) => {
              setCar(prev => {
                const newHealth = prev.health - damage;
                if (newHealth <= 0) handleGameOver("Car Destroyed");
                return { ...prev, health: Math.max(0, newHealth) };
              });
            }}
          />
        </>
      )}

      {gameState === GameState.GAMEOVER && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-xl">
          <h2 className="text-6xl font-orbitron font-bold text-white mb-4">RUN OVER</h2>
          <p className="text-xl text-red-300 font-orbitron mb-12 uppercase tracking-widest">
            {car.health <= 0 ? "VEHICLE CRITICAL FAILURE" : "MISSION OBJECTIVE FAILED"}
          </p>
          
          <button 
            onClick={() => setGameState(GameState.MENU)}
            className="px-12 py-4 bg-white text-black font-orbitron font-bold rounded-lg hover:bg-gray-200 transition-all"
          >
            RETURN TO BASE
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
