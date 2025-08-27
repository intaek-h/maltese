"use client";

import { useEffect, useState } from "react";
import { getRabbitConfig, setRabbitConfig } from "@/lib/canvas/movement";

export default function RabbitControls() {
  const [hopDistance, setHopDistance] = useState<number>(getRabbitConfig().hopDistance);
  const [hopHeight, setHopHeight] = useState<number>(getRabbitConfig().hopHeight);
  const [hopVelocity, setHopVelocity] = useState<number>(getRabbitConfig().hopVelocity);
  const [stopTime, setStopTime] = useState<number>(getRabbitConfig().stopTime);

  // Sync global config on change
  useEffect(() => {
    setRabbitConfig({ hopDistance, hopHeight, hopVelocity, stopTime });
  }, [hopDistance, hopHeight, hopVelocity, stopTime]);

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-50 w-[300px] rounded-lg border border-black/20 bg-white/90 p-3 shadow-[6px_6px_0_#000]">
      <h3 className="mb-2 text-sm font-bold">Rabbit Controls</h3>
      <div className="mb-2">
        <label className="mb-1 block text-xs font-semibold">
          Hop distance: <span className="font-normal">{Math.round(hopDistance)}px</span>
        </label>
        <input
          type="range"
          min={20}
          max={400}
          step={5}
          value={hopDistance}
          onChange={(e) => setHopDistance(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="mb-2">
        <label className="mb-1 block text-xs font-semibold">
          Hop height: <span className="font-normal">{Math.round(hopHeight)}px</span>
        </label>
        <input
          type="range"
          min={10}
          max={200}
          step={5}
          value={hopHeight}
          onChange={(e) => setHopHeight(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="mb-2">
        <label className="mb-1 block text-xs font-semibold">
          Hop velocity: <span className="font-normal">{Math.round(hopVelocity)}px/s</span>
        </label>
        <input
          type="range"
          min={20}
          max={600}
          step={10}
          value={hopVelocity}
          onChange={(e) => setHopVelocity(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold">
          Stop time: <span className="font-normal">{stopTime.toFixed(1)}s</span>
        </label>
        <input
          type="range"
          min={0.1}
          max={5}
          step={0.1}
          value={stopTime}
          onChange={(e) => setStopTime(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}