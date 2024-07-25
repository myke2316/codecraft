export const formatTime = (totalSeconds) => {
    const roundedSeconds = Math.floor(totalSeconds);

    if (roundedSeconds < 60) {
      return `${roundedSeconds} second${roundedSeconds !== 1 ? 's' : ''}`;
    } else if (roundedSeconds < 3600) {
      const minutes = Math.floor(roundedSeconds / 60);
      const seconds = roundedSeconds % 60;
      return `${minutes} minute${minutes !== 1 ? 's' : ''}, ${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(roundedSeconds / 3600);
      const minutes = Math.floor((roundedSeconds % 3600) / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };