import { useMemo } from 'react';
import Particles, { ParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export function FloatingParticlesBackground() {
  const particlesInit = async (engine: any): Promise<void> => {
    await loadSlim(engine);
  };

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'repulse' },
          resize: true,
        },
        modes: {
          repulse: { distance: 120, duration: 0.4 },
        },
      },
      particles: {
        color: { value: ['#7dd3fc', '#60a5fa', '#a78bfa', '#22d3ee'] },
        links: {
          color: '#38bdf8',
          distance: 150,
          enable: true,
          opacity: 0.12,
          width: 1,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: { default: 'out' },
          random: true,
          speed: 0.55,
          straight: false,
        },
        number: {
          density: { enable: true, area: 1200 },
          value: 52,
        },
        opacity: {
          value: { min: 0.12, max: 0.34 },
        },
        size: {
          value: { min: 0.9, max: 2.8 },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.32),transparent_32%)]" />
      <ParticlesProvider init={particlesInit}>
        <Particles id="dashboard-particles" options={options as any} className="absolute inset-0" />
      </ParticlesProvider>
    </div>
  );
}
