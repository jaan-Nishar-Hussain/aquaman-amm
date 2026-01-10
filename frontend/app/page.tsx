import {
  TotalVolume,
  TopChains,
  ChainCount,
  ProtocolStatsGrid,
} from "./components/ProtocolStats";
import Navigation from "./components/Navigation";
import ProtocolVisualization from "./components/ProtocolVisualization";

export default function Home() {
  return (
    <main className="font-mono min-h-screen max-w-[min(100vw,1600px)] mx-auto relative overflow-hidden md:rounded-md flex flex-col md:block px-6 pt-24 md:pt-28 bg-black">
      {/* Navigation */}
      <Navigation />

      <div className="w-full max-w-[1600px] space-y-6 mx-auto mb-12">
        {/* Mobile Layout */}
        <div className="flex flex-col min-[961px]:hidden">
          <section className="pb-6 w-full">
            <div className="flex flex-col gap-y-6">
              <TotalVolume />
              <TopChains />
            </div>
            <ChainCount />
          </section>

          <div className="w-full flex justify-center pointer-events-none">
            <ProtocolVisualization />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="relative hidden min-[961px]:grid grid-cols-2 gap-8 items-start">
          {/* Left side - Stats */}
          <section className="space-y-6">
            <TotalVolume />
            <TopChains />
            <ChainCount />
          </section>

          {/* Right side - Visualization */}
          <div className="flex justify-center items-center">
            <ProtocolVisualization />
          </div>
        </div>

        {/* Stats Grid */}
        <section className="mt-8">
          <ProtocolStatsGrid />
        </section>
      </div>
    </main>
  );
}
