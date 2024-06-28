import React from 'react';
import LessonContent from './Lesson/LessonContent';
import CourseSideBar from './Bar/CourseSideBar';
import { useNavigate } from 'react-router';

function CourseContent() {
    const navigate = useNavigate()
    
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-800 p-4 flex justify-between" onClick={() => navigate(-1)}>
        <button className="text-white hover:text-gray-200 flex">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <button type='button' >Back</button>
        </button>
        
        {/* navigation bar */}
        <nav className="flex flex-col w-[100vh]">
          <ul className='flex justify-evenly'>
            <li><a href="#" className="text-white hover:text-gray-200 py-2">Home</a></li>
            <li><a href="#" className="text-white hover:text-gray-200 py-2">Courses</a></li>
            <li><a href="#" className="text-white hover:text-gray-200 py-2">About</a></li>
          </ul>
        </nav>
      </div>

      <div className="flex-1 flex">
        {/* COurse Outline SideBar */}
        {<CourseSideBar />} 
        {/* Course Content/Lesson Content */}
          {<LessonContent />}
      </div>
    </div>
  );
}

export default CourseContent;