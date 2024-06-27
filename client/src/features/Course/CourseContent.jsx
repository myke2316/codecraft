import React from 'react';

function CourseContent() {
  return (
    <div className="h-screen flex">
      <nav className="bg-gray-800 h-screen w-64 p-4 hidden md:block">
        <ul>
          <li><a href="#" className="text-white hover:text-gray-200">Home</a></li>
          <li><a href="#" className="text-white hover:text-gray-200">Courses</a></li>
          <li><a href="#" className="text-white hover:text-gray-200">About</a></li>
        </ul>
      </nav>
      <div className="flex-1 p-4">
        <div className="md:flex md:flex-row">
          <div className="md:w-1/4 xl:w-1/5 p-4 md:block hidden">
            <h2 className="text-lg font-bold mb-4">Course Outline</h2>
            <ul>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Lesson 1</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Lesson 2</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900">Lesson 3</a></li>
            </ul>
          </div>
          <div className="md:w-3/4 xl:w-4/5 p-4">
            <h1 className="text-2xl font-bold mb-4">Course Content</h1>
            <div>CourseContent</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseContent;