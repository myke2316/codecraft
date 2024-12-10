

// export const runJavaScript = (jsCode) => {
//   let consoleOutput = '';

//   // Create a new context with a limited set of global objects
//   const context = {
//     console: {
//       log: (...args) => {
//         // Concatenate all arguments into a single string with spaces in between
//         consoleOutput += args.join(' ') + '\n';
//       }
//     }
//   };

//   // Create a new function to execute the code
//   const executeCode = (code) => {
//     // Define a function that sets up a new context
//     const func = new Function('context', `
//       with (context) {
//         ${code}
//       }
//     `);
//     return func(context);
//   };

//   try {
//     executeCode(jsCode);
//   } catch (error) {
//     return { error: error.message };
//   }

//   return { output: consoleOutput.trim() };
// };

import { spawn } from 'child_process';
const EXECUTION_TIMEOUT = 5000; // 5 seconds timeout

export const runJavaScript = (jsCode) => {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['-e', jsCode]);
    
    let output = '';
    let errorOutput = '';
    
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Execution timed out'));
    }, EXECUTION_TIMEOUT);

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        resolve({ error: errorOutput });
      } else {
        resolve({ output: output.trim() });
      }
    });
  });
};