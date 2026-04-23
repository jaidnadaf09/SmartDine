let cancelAudio: HTMLAudioElement | null = null;
let generalAudio: HTMLAudioElement | null = null;

const CANCEL_KEYWORDS = [
  "cancel",
  "cancelled",
  "canceled",
  "rejected",
  "declined",
  "no_show",
  "no-show",
];

function isCancelNotification(notification: any): boolean {
  if (!notification) return false;

  const valuesToCheck = [
    notification?.status,
    notification?.type,
    notification?.event,
    notification?.title,
    notification?.message,
  ]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase());

  const matched = valuesToCheck.some((value) =>
    CANCEL_KEYWORDS.some((keyword) => value.includes(keyword))
  );

  if (matched) {
    console.log("[SmartDine] Cancel notification detected:", notification);
  }

  return matched;
}


export const playNotificationSound = (notification?: any) => {
  try {
    if (!cancelAudio) cancelAudio = new Audio("/sounds/duck.mp3");
    if (!generalAudio) generalAudio = new Audio("/sounds/notification.mp3");

    cancelAudio.volume = 0.5;
    generalAudio.volume = 0.5;

    if (isCancelNotification(notification)) {
      cancelAudio.currentTime = 0;
      cancelAudio.play()
        .then(() => console.log("cancel sound played"))
        .catch(err => console.warn("cancel sound blocked", err));
    } else {
      generalAudio.currentTime = 0;
      generalAudio.play()
        .then(() => console.log("general notification sound played"))
        .catch(err => console.warn("general sound blocked", err));
    }
  } catch (err) {
    console.warn("Notification sound error", err);
  }
};
