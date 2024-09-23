import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/database.js";
import passportUtil from "./utils/passport.js";
import { userRouter } from "./routes/userRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { classRouter } from "./routes/classRoutes.js";
import { courseRouter } from "./routes/courseRoute.js";
import { progressRouter } from "./routes/studentCourseProgressRoutes.js";
import { analyticsRouter } from "./routes/userAnalyticsRoutes.js";
import { quizSubmissionRouter } from "./routes/quizSubmissionRoute.js";
import { activitySubmissionRouter } from "./routes/activitySubmissionRoute.js";

import { runJavaScript } from "./utils/sandbox.js";
import { spawn } from "child_process";

import { questionRouter } from "./routes/QuestionRoutes/questionRoutes.js";

import { announcementRouter } from "./routes/teacherFunction/announcementRoute.js";
import { assignmentRouter } from "./routes/teacherFunction/teacherAssignmentRoutes.js";

import { submissionRouter } from "./routes/teacherFunction/submissionRoute.js";
import {JSDOM} from 'jsdom'
dotenv.config();
connectDb();
const PORT = process.env.SERVER_PORT || 8000;
const app = express();
// para sa .env or .env.prodcution
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env';
dotenv.config({ path: envFile });
app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT} and ${process.env.FRONTEND_URL}`);
});
const allowedOrigins = [
  process.env.FRONTEND_URL, // Development environment
  'https://codecrafts.online', // Production environment
];
const corsOptions = {
  origin: ['http://localhost:5173', 'https://codecrafts.online'], // Your allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials
};
app.use(cors(corsOptions));
app.use(cookieParser());
passportUtil(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//routes
app.use("/api/users", userRouter);
app.use("/class", classRouter);
app.use("/auth", authRoutes);
app.use("/course", courseRouter);
app.use("/userProgress", progressRouter);
app.use("/analytics", analyticsRouter);
app.use("/quizSubmission", quizSubmissionRouter);
app.use("/activitySubmission", activitySubmissionRouter);
app.use("/qna", questionRouter);
app.use("/api/announcement", announcementRouter);
app.use("/api/assignment", assignmentRouter);
app.use("/api/student-submit", submissionRouter);

//for CODING ACTIVITY(Separate file soon) ===============================================================
// const executeCode = (jsCode, input) => {
//   try {
//     const script = new Script(jsCode);
//     const context = createContext({ input });
//     return script.runInContext(context);
//   } catch (error) {
//     return `Error: ${error.message}`;
//   }
// };
function normalizeOutput(output) {
  // Implement normalization logic here
  return output.trim().replace(/\s+/g, "");
}
// Utility function to normalize code(to move soon in a new file)
const htmlNormalizeCode = (code) => {
  const htmlNormalizeCode1 = (code) => {
    return code
      .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
      .replace(/\s+/g, "") // Remove all whitespace (spaces, tabs, newlines)
      .replace(/'([^']*)'/g, '"$1"') // Normalize quotes to double quotes
      .toLowerCase(); // Convert to lowercase
  };
  return htmlNormalizeCode1(code)
    .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
    .replace(/(?:\s+|\r?\n)+/g, " ") // Replace multiple spaces and newlines with a single space
    .replace(/[\s]*=[\s]*/g, "=") // Remove spaces around equals sign
    .replace(/\s+/g, " ") // Remove extra spaces
    .replace(/(\s)\/>/g, "/>") // Remove space before self-closing tags
    .replace(/'([^']*)'/g, '"$1"') // Normalize quotes to double quotes
    .toLowerCase(); // Convert to lowercase
};
app.post("/submit/html", (req, res) => {
  const { htmlCode, cssCode, jsCode, activity } = req.body;

  if (!activity) {
    return res.status(404).json({ error: "Activity not found" });
  }

  const testCases = activity.testCases || [];
  let totalPoints = 0;
  let maxPoints = testCases.reduce(
    (acc, testCase) => acc + testCase.required.length,
    0
  );

  // Set points based on difficulty
  let pointsForDifficulty;
  switch (activity.difficulty) {
    case "easy":
      pointsForDifficulty = 10;
      break;
    case "medium":
      pointsForDifficulty = 15;
      break;
    case "hard":
      pointsForDifficulty = 20;
      break;
    default:
      pointsForDifficulty = 10;
  }

  // Track total points awarded
  let totalAwardedPoints = 0;
  let feedback = []; // Collect feedback for each test case

  for (const testCase of testCases) {
    let htmlContent = htmlCode;

    if (cssCode) {
      htmlContent = htmlContent.replace(
        "</head>",
        `<style>${cssCode}</style></head>`
      );
    }

    if (jsCode) {
      htmlContent = htmlContent.replace(
        "</body>",
        `<script>${jsCode}</script></body>`
      );
    }

    const codeUser = htmlNormalizeCode(htmlContent);

    let points = 0;
    let currentIndex = 0;
    let correctCount = 0;

    // Iterate over each requirement
    for (let i = 0; i < testCase.required.length; i++) {
      const requirement = testCase.required[i];
      const testCaseSentence = testCase.testCaseSentences[i]; // Corresponding test case sentence
      const normalizedRequirement = htmlNormalizeCode(requirement);

      if (codeUser.includes(normalizedRequirement)) {
        correctCount += 1;
        points += 1;
        feedback.push({
          index: i,
          sentence: testCaseSentence,
          status: "correct",
        });
        console.log(codeUser);

        console.log(feedback);
        console.log(normalizedRequirement);
      } else {
        feedback.push({
          index: i,
          sentence: testCaseSentence,
          status: "incorrect",
        });
        console.log(feedback);
        console.log(normalizedRequirement);
        console.log(codeUser);
      }
    }

    // Award points based on correctness and order
    if (correctCount === testCase.required.length) {
      totalAwardedPoints += pointsForDifficulty; // Perfect score for this test case
    } else if (correctCount > 0) {
      // Partial credit
      totalAwardedPoints +=
        (pointsForDifficulty / testCase.required.length) * correctCount;
    }
  }

  // Determine if the overall submission passed
  const passed = totalAwardedPoints >= pointsForDifficulty / 2;

  res.json({
    totalPoints: totalAwardedPoints,
    passed,
    maxPoints: pointsForDifficulty,
    htmlCode,
    jsCode,
    cssCode,
    feedback, // Include feedback in the response
  });
});

const cssNormalizeCode = (code) => {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comments
    .replace(/\s*{\s*/g, "{") // Remove spaces around opening braces
    .replace(/\s*}\s*/g, "}") // Remove spaces around closing braces
    .replace(/\s*;\s*/g, ";") // Remove spaces around semicolons
    .replace(/:\s+/g, ":") // Remove spaces after colons
    .replace(/\s*:\s*/g, ":")
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .trim()
    .toLowerCase(); // Convert to lowercase
};
app.post("/submit/css", (req, res) => {
  const { htmlCode, cssCode, jsCode, activity } = req.body;
  console.log("LALALALLA "+cssCode)
  if (!activity) {
    return res.status(404).json({ error: "Activity not found" });
  }

  const testCases = activity.testCases || [];
  let totalPoints = 0;

  // Set points based on difficulty
  let pointsForDifficulty;
  switch (activity.difficulty) {
    case "easy":
      pointsForDifficulty = 10;
      break;
    case "medium":
      pointsForDifficulty = 15;
      break;
    case "hard":
      pointsForDifficulty = 20;
      break;
    default:
      pointsForDifficulty = 10;
  }

  // Track total points awarded
  let totalAwardedPoints = 0;
  let feedback = []; // Collect feedback for each test case

  for (const testCase of testCases) {
    let htmlContent = htmlCode;

    
    // Insert CSS into the HTML content
    if (cssCode) {
      htmlContent = htmlContent.replace(
        "</head>",
        `<style>${cssCode}</style></head>`
      );
    }

    // Add JavaScript to the HTML content
    if (jsCode) {
      htmlContent = htmlContent.replace(
        "</body>",
        `<script>${jsCode}</script></body>`
      );
    }

    // Normalize the HTML content
    const codeUser = cssNormalizeCode(htmlContent);

    let correctCount = 0;

    // Iterate over each requirement
    for (let i = 0; i < testCase.required.length; i++) {
      const requirement = testCase.required[i];
      const testCaseSentence = testCase.testCaseSentences[i]; // Corresponding test case sentence
      const normalizedRequirement = cssNormalizeCode(requirement);

      if (codeUser.includes(normalizedRequirement)) {
        correctCount += 1;
        feedback.push({
          index: i,
          sentence: testCaseSentence,
          status: "correct",
        });
        console.log(
          normalizedRequirement +
            " : TAMA ITO : correct count : " +
            correctCount
        );
      } else {
        feedback.push({
          index: i,
          sentence: testCaseSentence,
          status: "incorrect",
        });
        console.log(
       
          normalizedRequirement +
            " : mali ito : correct count : " +
            correctCount
        );
      }
    }

    // Award points based on the number of correct requirements found
    totalAwardedPoints +=
      (pointsForDifficulty / testCase.required.length) * correctCount;
  }

  // Determine if the overall submission passed
  const passed = totalAwardedPoints >= pointsForDifficulty / 2;

  res.json({
    totalPoints: totalAwardedPoints,
    passed,
    maxPoints: pointsForDifficulty,
    feedback, // Include feedback in the response
  });
});


const jsNormalizeCode = (code, addSemicolons = false) => {
  // Helper function to preserve whitespace in string literals
  const preserveStringWhitespace = (str) => {
    return str.replace(/(["'`])(?:(?!\1)[\s\S])*?\1/g, (match) =>
      match.replace(/\s+/g, " ")
    );
  };

  // Remove comments and normalize code
  code = code
    .replace(/\/\/.*$/gm, "") // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
    .replace(/\s*:\s*/g, ":") // Normalize spaces around colons
    .replace(/\s*,\s*/g, ", ") // Normalize spaces around commas
    .replace(/(\s*({|}|;|,|)\s*)/g, "$1") // Remove spaces around specific characters
    .replace(/\s+(?=\{|\}|)/g, "") // Remove space before specific characters
    .replace(/(?<=\}|\))\s+/g, "") // Remove space after } and )
    .replace(/(?<=;)\s+/g, "") // Remove space after ;
    .replace(/\s*([+\-*/%&|^!~=<>])\s*/g, "$1") // Normalize spaces around operators
    .replace(/(?<=\d)\s+(?=\d)/g, "") // Remove spaces between numbers
    .replace(/\s+/g, " ") // Normalize multiple spaces to a single space
    .trim(); // Trim leading and trailing spaces

  // Standardize quotes to single quotes
  code = preserveStringWhitespace(code).replace(/["`]/g, "'");

  // Standardize `console.log` concatenation: convert + to , inside console.log
  code = code.replace(/console\.log\s*\((.*?)\s*\+\s*(.*?)\)/g, "console.log($1, $2)");

  // Standardize `console.log` with commas and text concatenation: merge into one form
  code = code.replace(/console\.log\s*\((.*?)\s*,\s*(.*?)\)/g, (match, p1, p2) => {
    if (p1.trim().endsWith("'") || p1.trim().endsWith('"')) {
      return `console.log(${p1.trim()} + ${p2.trim()})`; // Normalize to + form
    }
    return match;
  });

  // Make semicolon addition optional
  if (addSemicolons) {
    const lines = code.split("\n");
    const normalizedLines = lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (
        trimmedLine &&
        !trimmedLine.endsWith(";") &&
        !trimmedLine.endsWith("{") &&
        !trimmedLine.endsWith("}") &&
        !lines[index + 1]?.trim().startsWith("}") &&
        !trimmedLine.endsWith(",")
      ) {
        return trimmedLine + ";";
      }
      return trimmedLine;
    });
    code = normalizedLines.join("\n");
  }

  // Convert to lowercase
  return code.toLowerCase();
};

const normalizeOutputJs = (output) => {
  return output.replace(/\s+/g, ' ').trim().toLowerCase();
};
app.post("/submit/javascriptconsole", (req, res) => {
  const { jsCode, activity } = req.body;

  if (!activity) {
    return res.status(404).json({ error: "Activity not found" });
  }

  const testCases = activity.testCases || [];
  const difficulty = activity.difficulty || "easy";
  const pointsForDifficulty = { easy: 10, medium: 15, hard: 20 }[difficulty] || 10;

  let totalAwardedPoints = 0;
  let lastTestCase = null;
  let allTestsPassed = true;
  let feedback = [];

  for (const testCase of testCases) {
    const { output: consoleOutput, error } = runJavaScript(jsCode);

    if (error) {
      return res.json({ 
        error, 
        passed: false, 
        totalPoints: 0, 
        maxPoints: pointsForDifficulty,
        feedback: [`Error in code execution: ${error}`]
      });
    }

    const normalizedJsCode = jsNormalizeCode(jsCode, false);
    let correctCount = 0;
    let currentIndex = 0;

    for (const requirement of testCase.required) {
      const normalizedRequirement = jsNormalizeCode(requirement, false);
      // Remove semicolons for comparison
      const cleanRequirement = normalizedRequirement.replace(/;/g, '');
      const cleanUserCode = normalizedJsCode.replace(/;/g, '');
      
      if (cleanUserCode.includes(cleanRequirement)) {
        correctCount++;
        console.log(`${requirement}: CORRECT`);
      } else {
        console.log(`${requirement}: INCORRECT or MISSING`);
      }
    }

    const testCaseScore = (pointsForDifficulty / testCase.required.length) * correctCount;
    totalAwardedPoints += testCaseScore;

    // Output comparison
    const requiredOutput = runJavaScript(testCase.input);
    const normalizedUserOutput = normalizeOutputJs(consoleOutput);
    const normalizedRequiredOutput = normalizeOutputJs(requiredOutput.output);

    if (normalizedUserOutput !== normalizedRequiredOutput) {
      allTestsPassed = false;
      console.log(`Output mismatch. Expected: ${requiredOutput.output}, Got: ${consoleOutput}`);
    } else {
      console.log("Output matches expected result.");
    }

    lastTestCase = testCase;
  }

  const passed = allTestsPassed && totalAwardedPoints >= pointsForDifficulty / 2;

  const finalUserOutput = runJavaScript(jsCode).output;
  const finalExpectedOutput = lastTestCase ? runJavaScript(lastTestCase.input).output : "";

  res.json({
    totalPoints: Math.round(totalAwardedPoints), // Round to nearest integer
    passed,
    maxPoints: pointsForDifficulty,
    expectedOutput: finalExpectedOutput,
    userOutput: finalUserOutput,language:"javascriptconsole"
    
  });
});







//ito nwala pa yung function() or function () pag may space don wala pa yan dyan
// const jsNormalizeCodeWeb = (code, addSemicolons = false) => {
//   // Helper function to preserve whitespace in string literals
//   const preserveStringWhitespace = (str) => {
//     return str.replace(/(["'`])(?:(?!\1)[\s\S])*?\1/g, (match) =>
//       match.replace(/\s+/g, " ")
//     );
//   };

//   // Remove comments and normalize code
//   code = code
//     .replace(/\/\/.*$/gm, "") // Remove single-line comments
//     .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
//     .replace(/\s*:\s*/g, ":") // Normalize spaces around colons
//     .replace(/\s*,\s*/g, ", ") // Normalize spaces around commas
//     .replace(/(\s*({|}|;|,|$$|$$)\s*)/g, "$1") // Remove spaces around specific characters
//     .replace(/\s+(?=\{|\}|$$|$$)/g, "") // Remove space before specific characters
//     .replace(/(?<=\}|\))\s+/g, "") // Remove space after } and )
//     .replace(/(?<=;)\s+/g, "") // Remove space after ;
//     .replace(/\s*([+\-*/%&|^!~=<>])\s*/g, "$1") // Normalize spaces around operators
//     .replace(/(?<=\d)\s+(?=\d)/g, "") // Remove spaces between numbers
//     .replace(/\s+/g, " ") // Normalize multiple spaces to a single space
//     .trim(); // Trim leading and trailing spaces

//   // Preserve DOM manipulation methods
//   code = code.replace(/\b(document\.|window\.|getElementById|querySelector|addEventListener)\b/g, match => `__PRESERVE__${match}__PRESERVE__`);

//   // Standardize quotes to single quotes
//   code = preserveStringWhitespace(code).replace(/["`]/g, "'");

//   // Restore preserved DOM manipulation methods
//   code = code.replace(/__PRESERVE__(.*?)__PRESERVE__/g, '$1');

//   // Make semicolon addition optional
//   if (addSemicolons) {
//     const lines = code.split("\n");
//     const normalizedLines = lines.map((line, index) => {
//       const trimmedLine = line.trim();
//       if (
//         trimmedLine &&
//         !trimmedLine.endsWith(";") &&
//         !trimmedLine.endsWith("{") &&
//         !trimmedLine.endsWith("}") &&
//         !lines[index + 1]?.trim().startsWith("}") &&
//         !trimmedLine.endsWith(",")
//       ) {
//         return trimmedLine + ";";
//       }
//       return trimmedLine;
//     });
//     code = normalizedLines.join("\n");
//   }

//   // Convert to lowercase, except for preserved DOM methods
//   return code.replace(/\b(?!document\.|window\.|getElementById|querySelector|addEventListener\b)\w+\b/g, match => match.toLowerCase());
// };


const jsNormalizeCodeWeb = (code, addSemicolons = false) => {
  // Helper function to preserve whitespace in string literals
  const preserveStringWhitespace = (str) => {
    return str.replace(/(["'`])(?:(?!\1)[\s\S])*?\1/g, (match) =>
      match.replace(/\s+/g, " ")
    );
  };

  // Remove comments and normalize code
  code = code
    .replace(/\/\/.*$/gm, "") // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
    .replace(/\s*:\s*/g, ":") // Normalize spaces around colons
    .replace(/\s*,\s*/g, ", ") // Normalize spaces around commas
    .replace(/(\s*({|}|;|,|$$|$$)\s*)/g, "$1") // Remove spaces around specific characters
    .replace(/\s+(?=\{|\}|$$|$$)/g, "") // Remove space before specific characters
    .replace(/(?<=\}|\))\s+/g, "") // Remove space after } and )
    .replace(/(?<=;)\s+/g, "") // Remove space after ;
    .replace(/\s*([+\-*/%&|^!~=<>])\s*/g, "$1") // Normalize spaces around operators
    .replace(/(?<=\d)\s+(?=\d)/g, "") // Remove spaces between numbers
    .replace(/\s+/g, " ") // Normalize multiple spaces to a single space
    .trim(); // Trim leading and trailing spaces

  // Preserve DOM manipulation methods
  code = code.replace(/\b(document\.|window\.|getElementById|querySelector|addEventListener)\b/g, match => `__PRESERVE__${match}__PRESERVE__`);

  // Standardize quotes to single quotes
  code = preserveStringWhitespace(code).replace(/["`]/g, "'");

  // Restore preserved DOM manipulation methods
  code = code.replace(/__PRESERVE__(.*?)__PRESERVE__/g, '$1');

  // Normalize function declarations
  code = code.replace(/\bfunction\s+\(/g, 'function('); // Remove space between 'function' and '('

  // Make semicolon addition optional
  if (addSemicolons) {
    const lines = code.split("\n");
    const normalizedLines = lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (
        trimmedLine &&
        !trimmedLine.endsWith(";") &&
        !trimmedLine.endsWith("{") &&
        !trimmedLine.endsWith("}") &&
        !lines[index + 1]?.trim().startsWith("}") &&
        !trimmedLine.endsWith(",")
      ) {
        return trimmedLine + ";";
      }
      return trimmedLine;
    });
    code = normalizedLines.join("\n");
  }

  // Convert to lowercase, except for preserved DOM methods
  return code.replace(/\b(?!document\.|window\.|getElementById|querySelector|addEventListener\b)\w+\b/g, match => match.toLowerCase());
};

const runJavaScriptWeb = (code, html) => {
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable"
  });

  const window = dom.window;
  const document = window.document;

  let output = '';
  const originalConsoleLog = console.log;
  window.console.log = (...args) => {
    output += args.join(' ') + '\n';
  };

  try {
    // Wrap the code in an IIFE to avoid polluting the global scope
    const wrappedCode = `
      (function() {
        ${code}
      })();
    `;
    
    // Execute the code in the context of the jsdom window
    window.eval(wrappedCode);

    console.log = originalConsoleLog;
    return { 
      output: output.trim(), 
      error: null, 
      document: dom.serialize() 
    };
  } catch (error) {
    console.log = originalConsoleLog;
    return { 
      output: null, 
      error: error.message, 
      document: dom.serialize() 
    };
  }
};

const compareDOMStructures = (expected, actual) => {
  const dom = new JSDOM();
  const parser = new dom.window.DOMParser();
  const expectedDOM = parser.parseFromString(expected, 'text/html');
  const actualDOM = parser.parseFromString(actual, 'text/html');

  const compareNodes = (node1, node2) => {
    if (node1.nodeType !== node2.nodeType) return false;
    if (node1.nodeType === dom.window.Node.TEXT_NODE) return node1.textContent.trim() === node2.textContent.trim();
    if (node1.nodeType === dom.window.Node.ELEMENT_NODE) {
      if (node1.tagName !== node2.tagName) return false;
      if (node1.attributes.length !== node2.attributes.length) return false;
      for (let i = 0; i < node1.attributes.length; i++) {
        const attr1 = node1.attributes[i];
        const attr2 = node2.getAttribute(attr1.name);
        if (attr2 !== attr1.value) return false;
      }
      if (node1.childNodes.length !== node2.childNodes.length) return false;
      for (let i = 0; i < node1.childNodes.length; i++) {
        if (!compareNodes(node1.childNodes[i], node2.childNodes[i])) return false;
      }
      return true;
    }
    return false;
  };

  return compareNodes(expectedDOM.body, actualDOM.body);
};
app.post("/submit/javascriptweb", (req, res) => {
  const { jsCode, activity } = req.body;

  if (!activity) {
    return res.status(404).json({ error: "Activity not found" });
  }

  const testCases = activity.testCases || [];
  const difficulty = activity.difficulty || "easy";
  const pointsForDifficulty = { easy: 10, medium: 15, hard: 20 }[difficulty] || 10;

  let totalAwardedPoints = 0;
  let lastTestCase = null;
  let allTestsPassed = true;
  let feedback = [];

  // Iterate over each test case
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const { output: consoleOutput, error, document: resultDocument } = runJavaScriptWeb(jsCode, activity.codeEditor.html);

    if (error) {
      return res.json({ 
        error, 
        passed: false, 
        totalPoints: 0, 
        maxPoints: pointsForDifficulty,
        feedbackError: [`Error in code execution: ${error}`]
      });
    }

    const normalizedJsCode = jsNormalizeCodeWeb(jsCode, false);
    let correctCount = 0;

    // Iterate over each requirement within the test case
    for (let j = 0; j < testCase.required.length; j++) {
      const requirement = testCase.required[j];
      const testCaseSentence = testCase.testCaseSentences[j]; // Corresponding test case sentence
      const normalizedRequirement = jsNormalizeCodeWeb(requirement, false);
      
      const cleanRequirement = normalizedRequirement.replace(/;/g, '');
      const cleanUserCode = normalizedJsCode.replace(/;/g, '');

      // Check if the user's code includes the requirement
      if (cleanUserCode.includes(cleanRequirement)) {
        correctCount += 1;
        feedback.push({
          index: j,
          sentence: testCaseSentence,
          status: "correct",
        });
      } else {
        feedback.push({
          index: j,
          sentence: testCaseSentence,
          status: "incorrect",
        });
      }
    }

    // Calculate the score for this test case
    const testCaseScore = (pointsForDifficulty / testCase.required.length) * correctCount;
    totalAwardedPoints += testCaseScore;

    // DOM structure comparison
    const expectedResult = runJavaScriptWeb(testCase.input, activity.codeEditor.html);
    const domMatches = compareDOMStructures(expectedResult.document, resultDocument);

  

    lastTestCase = testCase;
  }

  const passed = allTestsPassed && totalAwardedPoints >= pointsForDifficulty / 2;

  const finalResult = runJavaScriptWeb(jsCode, activity.codeEditor.html);

  res.json({
    totalPoints: Math.round(totalAwardedPoints),
    passed,
    maxPoints: pointsForDifficulty,

    feedback,language:"javascriptweb"
  });
});




app.post("/execute", (req, res) => {
  const { language, html, css, js } = req.body;

  if (language === "html") {
    let htmlContent = "";

    if (!html.includes("<!DOCTYPE html>")) {
      htmlContent += "<!DOCTYPE html>";
    }

    if (!html.includes("<html>")) {
      htmlContent += '<html lang="en">';
    }

    if (!html.includes("<head>")) {
      htmlContent += "<head>";
    }

    if (css) {
      htmlContent += `<style>${css}</style>`;
    }

    if (!html.includes("<title>")) {
      htmlContent += `<title>Output</title>`;
    }

    htmlContent += `
      </head>
      <body>
    `;

    htmlContent += html;

    if (js) {
      htmlContent += `<script>${js}</script>`;
    }

    if (!html.includes("</body>")) {
      htmlContent += "</body>";
    }

    if (!html.includes("</html>")) {
      htmlContent += "</html>";
    }

    res.json({ output: htmlContent });
  } else if (language === "css") {
    // Basic HTML structure to apply CSS
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Styled Page</title>
        <style>${css}</style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    res.json({ output: htmlContent });
  } else if (language === "javascriptweb") {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Output</title>
        ${css ? `<style>${css}</style>` : ""}
      </head>
      <body>
        ${html}
        ${js ? `<script>${js}</script>` : ""}
      </body>
      </html>
    `;
    res.json({ output: htmlContent });
  } else if (language === "javascriptconsole") {
    const child = spawn("node", ["-e", js]);

    let output = "";
    let errorOutput = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        res.status(500).json({ output: `Error: ${errorOutput}` });
      } else {
        // Remove ANSI escape codes
        output = output.replace(/\x1b\[\d+m/g, "");
        res.json({ output });
      }
    });
  } else {
    res.status(400).json({ output: `Unsupported language: ${language}` });
  }
});



app.get("/", (req, res) => {
  res.send(`Server or api is running. + ${process.env.FRONTEND_URL}`);
});
