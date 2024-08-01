import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./config/database.js";
import passportUtil from "./utils/passport.js";
import { userRouter } from "./routes/userRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { classRouter } from "./routes/classRoutes.js";
import { courseRouter } from "./routes/courseRoute.js";
import { progressRouter } from "./routes/studentCourseProgressRoutes.js";
import { analyticsRouter } from "./routes/userAnalyticsRoutes.js";
import { quizSubmissionRouter } from "./routes/quizSubmissionRoute.js";
import { activitySubmissionRouter } from "./routes/activitySubmissionRoute.js";

import esprima from 'esprima';
import estraverse from 'estraverse';
import { runJavaScript } from "./utils/sandbox.js";
import {  spawn } from "child_process";
import { Script, createContext } from "vm";

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
app.use("/activitySubmission", activitySubmissionRouter)

//for CODING ACTIVITY ===============================================================

const executeCode = (jsCode, input) => {
  try {
    const script = new Script(jsCode);
    const context = createContext({ input });
    return script.runInContext(context);
  } catch (error) {
    return `Error: ${error.message}`;
  }
};

// Utility function to normalize code(to move soon in a new file)
const htmlNormalizeCode = (code) => {
  return code
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
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
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

  // Remove extra spaces around certain characters, but preserve some space around operators
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

  // Add semicolon where required
  const lines = code.split('\n');
  const normalizedLines = lines.map((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}') && !lines[index + 1]?.trim().startsWith('}')) {
      return trimmedLine + ';';
    }
    return trimmedLine;
  });

  return normalizedLines.join(' ').toLowerCase();
};

function jsNormalizeCodeWeb(code) {
  // Remove comments
  code = code.replace(/\/\/.*|\/\*[^]*?\*\//g, '');

  // Parse the code into an AST
  const ast = esprima.parseScript(code, { comment: true, tokens: true, range: true });

  // Function to convert the AST to a normalized code string
  function astToCode(astNode) {
    let codeString = '';

    estraverse.traverse(astNode, {
      enter(node) {
        switch (node.type) {
          case 'Program':
          case 'BlockStatement':
          case 'ExpressionStatement':
            if (node.body && Array.isArray(node.body)) {
              codeString += node.body.map(astToCode).join(' ');
            }
            break;
          case 'Literal':
            codeString += node.value;
            break;
          case 'Identifier':
            codeString += node.name;
            break;
          case 'BinaryExpression':
            codeString += astToCode(node.left) + ' ' + node.operator + ' ' + astToCode(node.right);
            break;
          case 'CallExpression':
            codeString += astToCode(node.callee) + '(' + node.arguments.map(astToCode).join(', ') + ')';
            break;
          case 'FunctionDeclaration':
            codeString += 'function ' + node.id.name + '(' + node.params.map(astToCode).join(', ') + ') {' + astToCode(node.body) + '}';
            break;
          // Add more cases as needed
          default:
            codeString += '';
        }
      }
    });

    return codeString.trim();
  }

  // Generate normalized code string from AST
  const normalizedCode = astToCode(ast);
  
  // Normalize spaces
  return normalizedCode.replace(/\s+/g, ' ').trim();
}

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

    console.log("=================");
    console.log(codeUser);

    let points = 0;
    let currentIndex = 0;
    let correctCount = 0;

    for (const requirement of testCase.required) {
      const normalizedRequirement = htmlNormalizeCode(requirement);
      const index = codeUser.indexOf(normalizedRequirement, currentIndex);

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
  }

  // Determine if the overall submission passed
  const passed = totalAwardedPoints >= pointsForDifficulty / 2;

  res.json({
    totalPoints: totalAwardedPoints,
    passed,
    maxPoints: pointsForDifficulty,
    htmlCode,
    jsCode,
    cssCode
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

    let points = 0;
    let currentIndex = 0;
    let correctCount = 0;

    for (const requirement of testCase.required) {
      const normalizedRequirement = cssNormalizeCode(requirement);
      const index = codeUser.indexOf(normalizedRequirement, currentIndex);

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
  }

  // Determine if the overall submission passed
  const passed = totalAwardedPoints >= pointsForDifficulty / 2;
 
  res.json({
    totalPoints: totalAwardedPoints,
    passed,
    maxPoints: pointsForDifficulty,
  });
});

//working
app.post('/submit/javascriptweb', (req, res) => {
  const { jsCode, activity } = req.body;
  
  console.log("========================================")
  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
  }

  const testCases = activity.testCases || [];
  let totalPoints = 0;
  const maxPoints = testCases.length * 10;

  // Set points based on difficulty
  let pointsForDifficulty;
  switch (activity.difficulty) {
    case 'easy':
      pointsForDifficulty = 10;
      break;
    case 'medium':
      pointsForDifficulty = 15;
      break;
    case 'hard':
      pointsForDifficulty = 20;
      break;
    default:
      pointsForDifficulty = 10;
  }

  // Track total points awarded
  let totalAwardedPoints = 0;

  for (const testCase of testCases) {
    const { output: expectedOutput } = testCase;

    // Normalizing submitted code
    const normalizedJsCode = jsNormalizeCodeWeb(jsCode);
    let points = 0;
    let correctCount = 0;
    console.log("Normalized Js Code: "+normalizedJsCode)

    for (const requirement of testCase.required) {
      const normalizedRequirement = jsNormalizeCodeWeb(requirement);
      console.log("Normalized rq Code: "+normalizedRequirement)
      if (normalizedJsCode.includes(normalizedRequirement)) {
        correctCount += 1;
        points += 1;
        console.log(requirement + " : Correct : current score : " + points);
      } else {
        console.log(requirement + " : Incorrect : current score : " + points);
      }
    }

    // Award points based on correctness and order
    if (correctCount === testCase.required.length) {
      totalAwardedPoints += pointsForDifficulty; // Perfect score for this test case
    } else if (correctCount > 0) {
      // Partial credit
      totalAwardedPoints += (pointsForDifficulty / testCase.required.length) * correctCount;
    }
  }

  // Determine if the overall submission passed
  const passed = totalAwardedPoints >= pointsForDifficulty / 2;

  res.json({
    totalPoints: totalAwardedPoints,
    passed,
    maxPoints: pointsForDifficulty,
  });
});

//working - pwede ko din integrate dito yung jsNormalizeCodeWeb pero for now ito muna since nagana naman
app.post("/submit/javascriptconsole", (req, res) => {
  const { jsCode, activity } = req.body;
  // const activity = activities.find((activity) => activity.activityId === activityId);

  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
  }

  const testCases = activity.testCases || [];
  let totalPoints = 0;
  

  // Set points based on difficulty
  let pointsForDifficulty;
  switch (activity.difficulty) {
    case 'easy':
      pointsForDifficulty = 10;
      break;
    case 'medium':
      pointsForDifficulty = 15;
      break;
    case 'hard':
      pointsForDifficulty = 20;
      break;
    default:
      pointsForDifficulty = 10;
  }

  // Track total points awarded
  let totalAwardedPoints = 0;

  for (const testCase of testCases) {
    const { output: consoleOutput, error } = runJavaScript(jsCode);

    if (error) {
      return res.status(400).json({ error });
    }

    const normalizedJsCode = jsNormalizeCode(jsCode);
    let points = 0;
    let currentIndex = 0;
    let correctCount = 0;

    for (const requirement of testCase.required) {
      const normalizedRequirement = jsNormalizeCode(requirement);
      const index = normalizedJsCode.indexOf(normalizedRequirement, currentIndex);

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
      totalAwardedPoints += (pointsForDifficulty / testCase.required.length) * correctCount;
    }

    // Add points for correct console output

  }

  // Determine if the overall submission passed
  const passed = totalAwardedPoints >= pointsForDifficulty / 2;

  res.json({
    totalPoints: totalAwardedPoints,
    passed,
    maxPoints: pointsForDifficulty,
    
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
        output = output.replace(/\x1b\[\d+m/g, '');
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
