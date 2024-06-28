import { useSelector } from "react-redux";


function LessonLists({lesson}) {
   


  return (
    <>
        <li>
            {lesson.title}
        </li>
    </>
  )
}
export default LessonLists