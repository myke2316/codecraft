import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

function DocumentContent() {
  const { courseId, lessonId, documentId } = useParams();
  const navigate = useNavigate();
  const courses = useSelector((state) => state.course.courseData);
  const course = courses.find((course) => course._id === courseId);
  const lesson = course.lessons.find((lesson) => lesson._id === lessonId);
  const documents = lesson.documents;
  const currentIndex = documents.findIndex(
    (document) => document._id === documentId
  );
  const document = documents[currentIndex];

  const handleBack = () => {
    if (currentIndex > 0) {
      navigate(
        `/course/${courseId}/lesson/${lessonId}/document/${
          documents[currentIndex - 1]._id
        }`,
        {
          replace: true,
        }
      );
    }
  };

  const handleNext = () => {
    if (currentIndex < documents.length - 1) {
      navigate(`/course/${courseId}/lesson/${lessonId}/document/${documents[currentIndex + 1]._id}`, {
        replace: true,
      });
    } else {
      // Proceed to quiz when there are no documents left in the lesson
      navigate(`/course/${courseId}/lesson/${lessonId}/quiz/${lesson.quiz[0]._id}`, { replace: true });
    }
  };

  return (
    <div>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">
          {lesson.title} : {document.title}
        </h1>

        <hr />
        <div>
          <h3 className="text-1xl font-bold mt-4">{document.description}</h3>
        </div>
        <div className="flex justify-between mt-4">
          <button onClick={handleBack}>Back</button>
          <button onClick={handleNext}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default DocumentContent;
