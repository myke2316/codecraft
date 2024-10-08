import { setActivitySubmission } from "../features/Course/CodingActivity/activitySubmissionSlice";

export const createActivitySubmission = async (
  dispatch,
  createActivitySubmission,
  userId
) => {
  try {
    const activitySubmissionData = await createActivitySubmission({
      userId,
    }).unwrap();
    dispatch(setActivitySubmission(activitySubmissionData));
    console.log(activitySubmissionData);
  } catch (error) {
    console.log(error);
  }
};

export const getActivitySubmissions = async (
  dispatch,
  fetchActivitySubmissions,
  userId
) => {
  try {
    if (!userId) {
      console.log("No ID");
    }
    const activitySubmissionData = await fetchActivitySubmissions({
      userId,
    }).unwrap();
    dispatch(setActivitySubmission(activitySubmissionData));
    console.log(activitySubmissionData);
  } catch (error) {
    console.log(error);
  }
};

export const updateActivitySubmissionUtil = async (
  dispatch,
  updateActivitySubmission,
  userId,
  activityId,
  htmlCode,
  cssCode,
  jsCode,
  passed,
  totalPoints,
  timeTaken,
  tries
) => {
  try {
    const activitySubmissionData = await updateActivitySubmission({
      userId,
      activityId,
      html :htmlCode,
      css: cssCode,
      js: jsCode,
      passed,
      pointsEarned: totalPoints,
      timeTaken,
      tries,
    }).unwrap();
    dispatch(setActivitySubmission(activitySubmissionData));
    console.log(activitySubmissionData);

  } catch (error) {
    console.log(error);
  }
};
