
// export const runJavaScript = (jsCode) => {
//   let consoleOutput = '';

//   // Create a new context with a limited set of global objects
//   const context = {
//     console: {
//       log: (msg) => {
//         consoleOutput += msg + '\n';
//       }
//     },
//     // Add any other safe globals or functions here
//   };

//   // Use a function to evaluate the code in a restricted context
//   const safeEval = (code, context) => {
//     const func = new Function('context', `
//       with (context) {
//         return eval(${JSON.stringify(code)});
//       }
//     `);
//     return func(context);
//   };

//   try {
//     safeEval(jsCode, context);
//   } catch (error) {
//     return { error: error.message };
//   }

//   return { output: consoleOutput.trim() };
// };

export const runJavaScript = (jsCode) => {
  let consoleOutput = '';

  // Create a new context with a limited set of global objects
  const context = {
    console: {
      log: (...args) => {
        // Concatenate all arguments into a single string with spaces in between
        consoleOutput += args.join(' ') + '\n';
      }
    }
  };

  // Create a new function to execute the code
  const executeCode = (code) => {
    // Define a function that sets up a new context
    const func = new Function('context', `
      with (context) {
        ${code}
      }
    `);
    return func(context);
  };

  try {
    executeCode(jsCode);
  } catch (error) {
    return { error: error.message };
  }

  return { output: consoleOutput.trim() };
};
