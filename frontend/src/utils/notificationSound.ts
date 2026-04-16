let notificationAudio: HTMLAudioElement | null = null;

export const playNotificationSound = () => {
  try {
    notificationAudio = new Audio("/sounds/duck.mp3");
    notificationAudio.volume = 0.5;

    notificationAudio.play()
      .then(() => console.log("notification sound played"))
      .catch(err => console.warn("sound blocked", err));

  } catch (err) {
    console.warn("Notification sound error", err);
  }
};
