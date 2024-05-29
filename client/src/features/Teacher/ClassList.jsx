import { useSelector } from "react-redux";

function ClassList() {
  const classDetails = useSelector((state) => state.class.class);
  console.log(classDetails);
  return (
    <>
      {classDetails.map((classDetail) => (
        <div className="border p-5">{classDetail.className}</div>
      ))}
    </>
  );
}
export default ClassList;
