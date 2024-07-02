import { useSelector } from "react-redux";
import { useParams } from "react-router";
import LessonLists from "./LessonLists";

function LessonContent() {
  const { courseId, lessonId } = useParams();
  const courses = useSelector((state) => state.course.courseData);
  const course = courses.find((course) => course._id === courseId);
  const lesson = course.lessons.find((lesson) => lesson._id === lessonId);
  const documents = lesson.documents;
  return (
    <div className="flex-1 p-4">
      <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
      <hr />

      <div className="flex justify-around mt-4">
        <ul>
          {documents.map((state) => (
            <LessonLists
              lesson={state}
              documentId={state._id}
              key={state._id}
            />
          ))}{" "}
        </ul>
      </div>
    </div>
  );
}

export default LessonContent;
