// import player from 'node-wav-player';


// const filePath = './buzzer.wav';
// function delay(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }
//
// async function playWave() {
//   let count = 0
//   while (count < 5) {
//     try {
//       await player.play({ path: filePath });
//       await delay(5000)
//       count++;
//       console.log('Playing finished');
//     } catch (error) {
//       console.error('Error playing WAV file:', error);
//   }
//   await delay(5000);
//   }
// }

function playWave() {
  console.log('Playing sound...');
}
export {playWave};

// Example usage:
// const wavFilePath = './buzzer.wav';
// playWave();

