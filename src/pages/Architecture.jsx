import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ArchFlow from '@/components/architecture/ArchFlow';
import RealVsSimulated from '@/components/architecture/RealVsSimulated';
import DemoSteps from '@/components/architecture/DemoSteps';
import HardwareRoadmap from '@/components/architecture/HardwareRoadmap';
import FirmwareSketch from '@/components/architecture/FirmwareSketch';
import Limitations from '@/components/architecture/Limitations';

export default function Architecture() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-5 py-10 space-y-12">
        <header>
          <Link to="/app" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" />Back to app</Link>
          <p className="mt-6 font-mono text-[11px] tracking-[0.3em] text-muted-foreground">SYNCLET</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">A connected safety ecosystem.</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">MQTT connects the ESP32 and browser app. Follow the setup steps to flash the board and check the hardware link.</p>
        </header>
        <ArchFlow />
        <DemoSteps />
        <RealVsSimulated />
        <HardwareRoadmap />
        <FirmwareSketch />
        <Limitations />
      </div>
    </div>
  );
}
