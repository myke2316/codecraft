import { VM } from 'vm2';

export const runJavaScript = (jsCode) => {
  const vm = new VM({
    timeout: 1000,
    sandbox: {},
  });

  let consoleOutput = '';

  // Override console.log to capture the output
  const originalConsoleLog = console.log;
  console.log = (msg) => {
    consoleOutput += msg + '\n';
  };

  try {
    vm.run(`(function() { ${jsCode} })()`);
  } catch (error) {
    console.log = originalConsoleLog;  // Restore original console.log
    return { error: error.message };
  }

  console.log = originalConsoleLog;  // Restore original console.log

  return { output: consoleOutput.trim() };
};
