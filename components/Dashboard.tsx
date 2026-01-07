
import React from 'react';
import { Car, Mission } from '../types';

interface DashboardProps {
  car: Car;
  mission: Mission | null;
  timeLeft: number;
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ car, mission, timeLeft, onBack }) => {
  const speedKmh = Math.floor(car.speed * 20);
  
  return (
    <div className="absolute top-0 left-0 w-full p-6 pointer-events-none select-none z-10">
      <div className="flex justify-between items-start">
        {/* Speedometer */}
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
          <div className="text-gray-400 text-xs uppercase tracking-widest font-bold">Speed</div>
          <div className="flex items-baseline space-x-1">
            <span className="text-4xl font-orbitron text-blue-400 font-bold leading-none">
              {speedKmh}
            </span>
            <span className="text-sm text-gray-500 font-bold uppercase">km/h</span>
          </div>
          {/* Visual Bar */}
          <div className="w-32 h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-100" 
              style={{ width: `${Math.min((speedKmh / 160) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Mission Details */}
        {mission && (
          <div className="bg-black/60 backdrop-blur-md border border-emerald-500/30 p-4 rounded-xl max-w-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Active Mission</span>
              <span className="text-xs text-white/50">{mission.difficulty}</span>
            </div>
            <h3 className="text-white font-orbitron text-sm mb-1">{mission.title}</h3>
            <p className="text-white/70 text-xs leading-relaxed mb-3">{mission.objective}</p>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-orbitron text-white">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-white/50">Time Remaining</div>
            </div>
          </div>
        )}

        {/* Health */}
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl pointer-events-auto">
          <div className="text-gray-400 text-xs uppercase tracking-widest font-bold text-right">Integrity</div>
          <div className="flex items-center space-x-3 mt-1">
            <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full transition-all duration-300 ${car.health > 40 ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${car.health}%` }}
              />
            </div>
            <span className="text-xl font-orbitron font-bold min-w-[3rem] text-right">{Math.ceil(car.health)}%</span>
          </div>
          <button 
            onClick={onBack}
            className="mt-4 w-full py-1 text-[10px] uppercase font-bold tracking-widest text-white/50 hover:text-white hover:bg-white/10 rounded border border-white/10 transition-colors"
          >
            Abort Run
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
