import { setQuizSubmission } from "../features/Course/Quiz/quizSubmissionSlice";

export const createQuizSubmission = async (
  dispatch,
  createUserQuizSubmissions,
  userId
) => {
  try {
    const quizSubmissionData = await createUserQuizSubmissions({
      userId,
    }).unwrap();
    dispatch(setQuizSubmission(quizSubmissionData));
    console.log(quizSubmissionData);
  } catch (error) {
    console.log(error);
  }
};

export const getQuizSubmission = async (
  dispatch,
  fetchUserQuizSubmission,
  userId
) => {
  try {
    if (!userId) {
      console.log("No ID");
    }
    const quizSubmissionData = await fetchUserQuizSubmission({
      userId,
    }).unwrap();
    dispatch(setQuizSubmission(quizSubmissionData));
    console.log(quizSubmissionData);
  } catch (error) {
    console.log(error);
  }
};

export const updateQuizSubmissionUtil = async (
  dispatch,
  updateUserQuizSubmissions,
  userId,
  quizId,
  selectedOption,
  correct,
  pointsEarned,
  correctAnswer
) => {
  try {
      console.log(userId, quizId, selectedOption, correct, pointsEarned);
    const quizSubmissionData = await updateUserQuizSubmissions({
      userId,
      quizId,
      selectedOption,
      correct,
      pointsEarned,
      correctAnswer
    }).unwrap();
    dispatch(setQuizSubmission(quizSubmissionData));
  } catch (error) {
    console.log(error);
  }
};
