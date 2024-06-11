import { useSelector } from "react-redux";

function ClassList() {
  const classDetails = useSelector((state) => state.class.class);
  console.log(classDetails);
  return (
    <>
      {classDetails ? classDetails.map((classDetail, index) => (
        <div key = {index} className="border p-5">{classDetail.className}</div>
      )) : <h1>No Class</h1>}
    </>
  );
}
export default ClassList;
