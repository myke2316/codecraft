import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router";

function LessonContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const courses = useSelector((state) => state.course.courseData);
  const course = courses.find((course) => course._id === courseId);
  
  // State to track the current lesson index
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  useEffect(() => {
    // Reset lesson index when the course changes
    setCurrentLessonIndex(0);
  }, [courseId]);

  const handleNextLesson = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else {
      // If the last lesson is completed, navigate to the next course
      navigate(-1); // Replace with the actual next course ID logic
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const currentLesson = course.lessons[currentLessonIndex];

  return (
    <div className="flex-1 p-4">
      <h1 className="text-2xl font-bold mb-4">{currentLesson.title}</h1>
      {currentLesson.documents.map((document, index) => (
        <div key={index}>
          <h2>{document.title}</h2>
          <p>{document.description}</p>
          <hr />
        </div>
      ))}

      <div className="flex justify-around">
        <button className="bg-red-300" onClick={handlePreviousLesson} disabled={currentLessonIndex === 0}>
          Back
        </button>
        <button className="bg-green-300" onClick={handleNextLesson}>
          Next
        </button>
      </div>
    </div>
  );
}

export default LessonContent;
