export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission === 'denied') {
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function showTimerNotification(title: string, body: string): void {
  if (typeof window === 'undefined') return;
  
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'timer-arena',
    });
  }
}

export function getCompletedNotification(mode: 'work' | 'break'): { title: string; body: string } {
  if (mode === 'work') {
    return {
      title: 'Work session complete!',
      body: 'Great job! Time for a break.',
    };
  }
  return {
    title: 'Break is over!',
    body: 'Ready to focus again?',
  };
}
