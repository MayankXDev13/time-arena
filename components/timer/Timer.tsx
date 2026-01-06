import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TimerModeSelector } from './TimerModeSelector';
import { useTimer } from '@/hooks/useTimer';
import { useTimerStore } from '@/stores/useTimerStore';

export function Timer() {
  const { start, pause, resume, stop, reset, actualElapsed } = useTimer();
  const { isRunning, elapsed, isCompleted, mode, workDuration, breakDuration } = useTimerStore();

  const handleStop = async () => {
    await stop();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <TimerModeSelector />
      <TimerDisplay
        elapsed={elapsed}
        isRunning={isRunning}
        isCompleted={isCompleted}
        mode={mode}
        workDuration={workDuration}
        breakDuration={breakDuration}
      />
      <TimerControls
        isRunning={isRunning}
        elapsed={elapsed}
        isCompleted={isCompleted}
        start={start}
        pause={pause}
        resume={resume}
        stop={handleStop}
        reset={reset}
      />
    </div>
  );
}
