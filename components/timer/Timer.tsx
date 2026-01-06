import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';

export function Timer() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <TimerDisplay />
      <TimerControls />
    </div>
  );
}
