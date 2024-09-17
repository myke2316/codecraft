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

import esprima from "esprima";
import estraverse from "estraverse";
import { runJavaScript } from "./utils/sandbox.js";
import { spawn } from "child_process";
import { Script, createContext } from "vm";
import { questionRouter } from "./routes/QuestionRoutes/questionRoutes.js";


import { announcementRouter } from "./routes/teacherFunction/announcementRoute.js";
import { assignmentRouter } from "./routes/teacherFunction/teacherAssignmentRoutes.js";
import { gfs } from "./sandboxUserFiles/gridFs.js";
import { submissionRouter } from "./routes/teacherFunction/submissionRoute.js";

dotenv.config();
connectDb();
const PORT = process.env.SERVER_PORT || 8000;
const app = express();

app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  next();
});

//to be able to respond and get json files and is a middleware for backend and frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET, POST, PATCH, DELETE, PUT",
  })
);
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
app.use("/api/student-submit", submissionRouter)


//for CODING ACTIVITY ===============================================================
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
const jsNormalizeCode = (code) => {
  const preserveStringWhitespace = (str) => {
    return str.replace(/(["'`])(?:(?!\1)[\s\S])*?\1/g, (match) =>
      match.replace(/\s+/g, " ")
    );
  };

  // Remove single-line comments
  code = code.replace(/\/\/.*$/gm, "");

  // Remove multi-line comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, "");

  // Preserve and normalize string literals
  code = preserveStringWhitespace(code);

  // Standardize quotes to single quotes
  code = code.replace(/["`]/g, "'");

  code = code.replace(/\s*:\s*/g, ":");
  code = code.replace(/\s*,\s*/g, ", ");

  // Remove extra spaces around certain characters
  code = code
    .replace(/(\s*({|}|;|,|\(|\))\s*)/g, "$1") // Remove spaces around `{}`, `;`, `,`, `()`
    .replace(/\s+(?=\{|\}|\(|\))/g, "") // Remove space before `{`, `}`, `(`, `)`
    .replace(/(?<=\})\s+/g, "") // Remove space after `}`
    .replace(/(?<=\))\s+/g, "") // Remove space after `)`
    .replace(/(?<=;)\s+/g, "") // Remove space after `;`
    .replace(/\s*([+\-*/%&|^!~=<>])\s*/g, "$1") // Normalize spaces around operators
    .replace(/(?<=\d)\s+(?=\d)/g, ""); // Remove spaces between numbers (e.g., 1 000 becomes 1000)

  // Normalize multiple spaces to a single space
  code = code.replace(/\s+/g, " ");

  // Trim leading and trailing spaces
  code = code.trim();

  // Add semicolon where required, but avoid adding unnecessary semicolons
  const lines = code.split("\n");
  const normalizedLines = lines.map((line, index) => {
    const trimmedLine = line.trim();
    if (
      trimmedLine &&
      !trimmedLine.endsWith(";") &&
      !trimmedLine.endsWith("{") &&
      !trimmedLine.endsWith("}") &&
      !lines[index + 1]?.trim().startsWith("}") &&
      !trimmedLine.endsWith(",") // Avoid adding semicolon after comma
    ) {
      return trimmedLine + ";";
    }
    return trimmedLine;
  });

  // Join lines with newline characters to preserve line structure
  return normalizedLines.join("\n").toLowerCase();
};
const jsNormalizeCodeWeb = (code) => {
  const preserveStringWhitespace = (str) => {
    return str.replace(/(["'`])(?:(?!\1)[\s\S])*?\1/g, (match) =>
      match.replace(/\s+/g, " ")
    );
  };

  // Remove single-line comments
  code = code.replace(/\/\/.*$/gm, "");

  // Remove multi-line comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, "");

  // Preserve and normalize string literals
  code = preserveStringWhitespace(code);

  // Standardize quotes to single quotes
  code = code.replace(/["`]/g, "'");

  // Normalize spaces around specific characters
  code = code
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*,\s*/g, ", ")
    .replace(/(\s*({|}|;|,|\(|\))\s*)/g, "$1") // Remove spaces around `{}`, `;`, `,`, `()`
    .replace(/\s+(?=\{|\}|\(|\))/g, "")
    .replace(/(?<=\})\s+/g, "")
    .replace(/(?<=\))\s+/g, "")
    .replace(/(?<=;)\s+/g, "")
    .replace(/\s*([+\-*/%&|^!~=<>])\s*/g, "$1")
    .replace(/(?<=\d)\s+(?=\d)/g, "");

  // Normalize multiple spaces to a single space
  code = code.replace(/\s+/g, " ");

  // Trim leading and trailing spaces
  code = code.trim();

  // Add semicolon where required, but avoid adding unnecessary semicolons
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

  return normalizedLines.join("\n").toLowerCase();
};
//function or api to call to handle the submit for coding activity and check student coede
//working

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
          status: 'correct',
        });
        console.log(codeUser)
     
        console.log(feedback)
        console.log(normalizedRequirement)
      } else {
        feedback.push({
          index: i,
          sentence: testCaseSentence,
          status: 'incorrect',
        });
        console.log(feedback)
        console.log(normalizedRequirement)
        console.log(codeUser)
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

//working
app.post("/submit/css", (req, res) => {
  const { htmlCode, cssCode, jsCode, activity } = req.body;

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
          status: 'correct',
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
          status: 'incorrect',
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

//working
app.post("/submit/javascriptweb", (req, res) => {
  const { jsCode, activity } = req.body;

  if (!activity) {
    return res.status(404).json({ error: "Activity not found" });
  }

  const testCases = activity.testCases || [];
  const pointsForDifficulty =
    {
      easy: 10,
      medium: 15,
      hard: 20,
    }[activity.difficulty] || 10;

  let totalAwardedPoints = 0;

  for (const testCase of testCases) {
    const { output: expectedOutput, required } = testCase;

    const normalizedJsCode = jsNormalizeCode(jsCode);
    let correctCount = 0;

    for (const requirement of required) {
      const normalizedRequirement = jsNormalizeCodeWeb(requirement);
      if (normalizedJsCode.includes(normalizedRequirement)) {
        correctCount += 1;
      }
    }

    if (correctCount === required.length) {
      totalAwardedPoints += pointsForDifficulty;
    } else if (correctCount > 0) {
      totalAwardedPoints +=
        (pointsForDifficulty / required.length) * correctCount;
    }
  }

  const passed = totalAwardedPoints >= pointsForDifficulty / 2;

  res.json({
    totalPoints: totalAwardedPoints,
    passed,
    maxPoints: pointsForDifficulty,
  });
});
//working
app.post("/submit/javascriptconsole", (req, res) => {
  const { jsCode, activity } = req.body;

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
  let lastTestCase = null;

  for (const testCase of testCases) {
    const { output: consoleOutput, error } = runJavaScript(jsCode);

    if (error) {
      return res.json({ error });
    }

    const normalizedJsCode = jsNormalizeCode(jsCode);
    let points = 0;
    let currentIndex = 0;
    let correctCount = 0;

    for (const requirement of testCase.required) {
      const normalizedRequirement = jsNormalizeCode(requirement);

      const index = normalizedJsCode.indexOf(
        normalizedRequirement,
        currentIndex
      );

      if (index !== -1) {
        correctCount += 1;
        points += 1;
        currentIndex = index + normalizedRequirement.length;
        console.log(
          normalizedRequirement + " : TAMA ITO : current score : " + points
        );
      } else {
        console.log(
          normalizedRequirement + " : mali ito : current score : " + points
        );
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

    // Store the last test case to use for output comparison
    lastTestCase = testCase;

    // If the total awarded points exceed 5, perform output comparison
    if (totalAwardedPoints > 5) {
      const requiredOutput = runJavaScript(testCase.input);
      const normalizedUserOutput = normalizeOutput(consoleOutput);
      const normalizedRequiredOutput = normalizeOutput(requiredOutput.output);

      if (normalizedUserOutput === normalizedRequiredOutput) {
        // If output matches, award perfect points
        totalAwardedPoints = pointsForDifficulty; // Reset to full points
      } else {
        // User output does not match required output
        return res.json({
          totalPoints: totalAwardedPoints,
          passed: false,
          maxPoints: pointsForDifficulty,
          expectedOutput: requiredOutput.output,
          userOutput: consoleOutput,
        });
      }
    }
  }

  // Determine if the overall submission passed
  const passed = totalAwardedPoints >= pointsForDifficulty / 2;

  // Collect final output for the response
  const finalUserOutput = runJavaScript(jsCode).output;
  const finalExpectedOutput = lastTestCase
    ? runJavaScript(lastTestCase.input).output
    : "";

  res.json({
    totalPoints: totalAwardedPoints,
    passed,
    maxPoints: pointsForDifficulty,
    expectedOutput: finalExpectedOutput,
    userOutput: finalUserOutput,
  });
});
//when user clicked on run, this code will run to return the expected output of the user's code
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
  res.send("Server or api is running.");
});
