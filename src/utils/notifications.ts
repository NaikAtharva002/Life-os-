export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function scheduleEveningReminder(time: string, callback: () => void): () => void {
  const [hours, minutes] = time.split(':').map(Number);

  const getNextMs = (): number => {
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime() - now.getTime();
  };

  let timeoutId: ReturnType<typeof setTimeout>;
  let intervalId: ReturnType<typeof setInterval>;

  timeoutId = setTimeout(() => {
    callback();
    intervalId = setInterval(callback, 24 * 60 * 60 * 1000);
  }, getNextMs());

  return () => {
    clearTimeout(timeoutId);
    clearInterval(intervalId);
  };
}

export function showNotification(title: string, body: string, onClick?: () => void): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const notification = new Notification(title, { body, icon: '/favicon.ico' });
  if (onClick) {
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  }
}
