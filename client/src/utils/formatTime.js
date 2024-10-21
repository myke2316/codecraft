export const formatTime = (totalSeconds) => {
    const roundedSeconds = Math.floor(totalSeconds);

    if (roundedSeconds < 60) {
      return `${roundedSeconds} s${roundedSeconds !== 1 ? '' : ''}`;
    } else if (roundedSeconds < 3600) {
      const minutes = Math.floor(roundedSeconds / 60);
      const seconds = roundedSeconds % 60;
      return `${minutes} min${minutes !== 1 ? 's' : ''}, ${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(roundedSeconds / 3600);
      const minutes = Math.floor((roundedSeconds % 3600) / 60);
      return `${hours}h${hours !== 1 ? '' : ''}, ${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
  };