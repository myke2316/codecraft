import asyncHandler from "express-async-handler";

import CourseModel from "../models/courseModel.js";

const getAllCourse = asyncHandler(async (req, res) => {
  try {
    const courses = await CourseModel.find({});
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// Update course title
const updateCourseTitle = asyncHandler(async (req, res) => {
  const { courseId, title } = req.body;

  try {
    const course = await CourseModel.findByIdAndUpdate(
      courseId,
      { title },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res
      .status(200)
      .json({ message: "Course title updated successfully", course });
  } catch (error) {
    res.status(500).json({ error: "Failed to update course title" });
  }
});
// Update lesson title within a course
const updateLessonTitle = asyncHandler(async (req, res) => {
  const { courseId, lessonId, title } = req.body;

  try {
    const course = await CourseModel.findOneAndUpdate(
      { _id: courseId, "lessons._id": lessonId },
      { $set: { "lessons.$.title": title } },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ error: "Course or Lesson not found" });
    }

    res.status(200).json({
      message: "Lesson title updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update lesson title" });
  }
});
// Update quiz fields within a lesson
const updateQuiz = asyncHandler(async (req, res) => {
  const { courseId, lessonId, quizId, question, options, correctAnswer } =
    req.body;

  try {
    const updateFields = {};
    if (question !== undefined)
      updateFields["lessons.$[lesson].quiz.$[quiz].question"] = question;
    if (options !== undefined)
      updateFields["lessons.$[lesson].quiz.$[quiz].options"] = options;
    if (correctAnswer !== undefined)
      updateFields["lessons.$[lesson].quiz.$[quiz].correctAnswer"] =
        correctAnswer;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    const course = await CourseModel.findOneAndUpdate(
      { _id: courseId, "lessons._id": lessonId, "lessons.quiz._id": quizId },
      { $set: updateFields },
      {
        arrayFilters: [{ "lesson._id": lessonId }, { "quiz._id": quizId }],
        new: true,
      }
    );

    if (!course) {
      return res
        .status(404)
        .json({ error: "Course, Lesson, or Quiz not found" });
    }

    res.status(200).json({
      message: "Quiz updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update quiz" });
  }
});
// Update activity fields within a lesson
const updateActivity = asyncHandler(async (req, res) => {
  const {
    courseId,
    lessonId,
    activityId,
    title,
    description,
    language,
    difficulty,
    problemStatement,
    codeEditor,
    testCases,
    expectedImage,
    locked,
    completed,
  } = req.body;

  try {
    const course = await CourseModel.findOne({
      _id: courseId,
      "lessons._id": lessonId,
      "lessons.activities._id": activityId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course, lesson, or activity not found" });
    }

    const lesson = course.lessons.id(lessonId);
    const activity = lesson.activities.id(activityId);

    if (title !== undefined) activity.title = title;
    if (description !== undefined) activity.description = description;
    if (language !== undefined) activity.language = language;
    if (difficulty !== undefined) activity.difficulty = difficulty;
    if (problemStatement !== undefined)
      activity.problemStatement = problemStatement;

    if (codeEditor) {
      activity.codeEditor.html = codeEditor.html || activity.codeEditor.html;
      activity.codeEditor.css = codeEditor.css || activity.codeEditor.css;
      activity.codeEditor.js = codeEditor.js || activity.codeEditor.js;
    }

    if (testCases && Array.isArray(testCases)) {
      activity.testCases = testCases.map((testCase, index) => {
        return {
          input: testCase.input || activity.testCases[index]?.input || "",
          output: testCase.output || activity.testCases[index]?.output || "",
          required:
            testCase.required || activity.testCases[index]?.required || [],
          isHidden:
            testCase.isHidden || activity.testCases[index]?.isHidden || false,
          testCaseSentences:
            testCase.testCaseSentences ||
            activity.testCases[index]?.testCaseSentences ||
            [],
          expectedImage:
            testCase.expectedImage ||
            activity.testCases[index]?.expectedImage ||
            "",
        };
      });

      const isValidTestCases = activity.testCases.every(
        (tc) => tc.required.length === tc.testCaseSentences.length
      );

      if (!isValidTestCases) {
        return res.status(400).json({
          message:
            "Each test case's required and testCaseSentences must have the same length.",
        });
      }
    }

    if (expectedImage !== undefined) activity.expectedImage = expectedImage;
    if (locked !== undefined) activity.locked = locked;
    if (completed !== undefined) activity.completed = completed;

    await course.save();

    res
      .status(200)
      .json({ message: "Activity updated successfully", activity });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update activity", error: error.message });
  }
});
// Update document fields within a lesson
const updateDocument = async (req, res) => {
  const { courseId, lessonId, documentId, title, content } = req.body;

  try {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const lesson = course.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const document = lesson.documents.id(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Update title if provided
    if (title) {
      document.title = title;
    }

    // Update content if provided
    if (content && Array.isArray(content)) {
      content.forEach((item) => {
        const { _id, type, text, code, supportingCode, language } = item;

        // Find the corresponding content by _id (MongoDB's auto-generated field)
        const existingContent = document.content.id(_id); // This uses the auto-generated _id field
        if (!existingContent) {
          throw new Error(`Content with _id ${_id} not found`);
        }

        // Ensure type is updated and clear out irrelevant fields based on type
        existingContent.type = type || existingContent.type;

        switch (type) {
          case "sentence":
            // For "sentence", text is required, so set it
            if (text) {
              existingContent.text = text;
            } else {
              throw new Error("Text is required for sentence type");
            }
            // Clear out fields that are not used by sentence type
            existingContent.code = undefined;
            existingContent.supportingCode = undefined;
            existingContent.language = undefined;
            break;

          case "snippet":
            // For "snippet", code is required, so set it
            if (code) {
              existingContent.code = code;
            } else {
              throw new Error("Code is required for snippet type");
            }
            // Clear out fields that are not used by snippet type
            existingContent.text = undefined;
            existingContent.supportingCode = undefined;
            existingContent.language = undefined;
            break;

          case "code":
            // For "code", both code and language are required, so set them
            if (code && language) {
              existingContent.code = code;
              existingContent.language = language;
            } else {
              throw new Error("Code and language are required for code type");
            }
            // Clear out fields that are not used by code type
            existingContent.text = undefined;
            existingContent.supportingCode = undefined;
            break;

          case "codeconsole":
            // For "codeconsole", code and language are required
            if (code && language) {
              existingContent.code = code;
              existingContent.language = language;
            } else {
              throw new Error("Code and language are required for codeconsole type");
            }
            // Clear out fields that are not used by codeconsole type
            existingContent.text = undefined;
            existingContent.supportingCode = undefined;
            break;

          case "javascriptweb":
            // For "javascriptweb", code, language, and supportingCode are required
            if (code && language && supportingCode) {
              existingContent.code = code;
              existingContent.language = language;
              existingContent.supportingCode = supportingCode;
            } else {
              throw new Error("Code, language, and supportingCode are required for javascriptweb type");
            }
            // Clear out fields that are not used by javascriptweb type
            existingContent.text = undefined;
            break;

          default:
            throw new Error(`Invalid content type: ${type}`);
        }
      });
    }

    await course.save();

    res
      .status(200)
      .json({ message: "Document updated successfully", document });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(400).json({ message: error.message });
  }
};



export {
  getAllCourse,
  updateCourseTitle,
  updateLessonTitle,
  updateQuiz,
  updateActivity,
  updateDocument
};
