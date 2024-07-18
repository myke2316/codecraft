import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import CourseSideBar from "./Bar/CourseSideBar";


function CourseContent() {

  const [selectedLesson, setSelectedLesson] = useState(null);

  return (
    <div className="h-screen flex flex-col">
      <div className="h-screen flex flex-col">
        <div className="flex-1 flex">
          <CourseSideBar setSelectedLesson={setSelectedLesson} />
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default CourseContent;
