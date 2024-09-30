import "./Course.css";
import frontendicon from "./images/frontend.png";
import htmlcourse from "./images/htmlcourse.png";
import csscourseimg from "./images/csscourse.png";
import jscourseimg from "./images/javascriptcourse.png";
import phpcourse from "./images/phpcourse.png";

function Course() {
  return (
    <div className="coursecontainer">
      <div className="frontendtitle">
        <img className="fronticon" src={frontendicon} alt="" />
        <h1 className="fronttitle">Front-End</h1>
        <img className="fronticon" src={frontendicon} alt="" />
      </div>
      <div className="htmlandcss">
        <div className="htmlcourse">
          <div className="htmldesc">
            <div className="htmltext">
              <h1 className="htmltitle">
                <span style={{ color: "rgb(228, 77, 38)" }}>{"<"}</span>
                {"HTML/"}
                <span style={{ color: "rgb(228, 77, 38)" }}>{">"}</span>
              </h1>
              <p>
                <span style={{ color: "rgb(228, 77, 38)" }}>
                  {"HTML (Hypertext Markup Language)"}
                </span>
                {
                  " is the standard language used to create and structure content on the web. It defines the structure of web pages using a series of elements or tags, such as <p> for paragraphs, <a> for links, and <div> for divisions or sections. "
                }
              </p>
            </div>
            <div className="imagehtmlcourse">
              <img src={htmlcourse} alt="" />
            </div>
          </div>
        </div>
        <div className="csscourse">
          <div className="htmldesc">
            <div className="htmltext">
              <h1 className="htmltitle">
                <span style={{ color:"rgb(38, 77, 228)" }}>{"<"}</span>
                {"CSS/"}
                <span style={{ color: "rgb(38, 77, 228)" }}>{">"}</span>
              </h1>
              <p>
                <span style={{ color: "rgb(38, 77, 228)" }}>
                  {"CSS (Cascading Style Sheets)"}
                </span>
                {
                  " is a stylesheet language used to describe the presentation of a document written in HTML or XML. CSS defines how elements should be displayed on a webpage, allowing developers to control the layout, colors, fonts, and overall visual appearance of the content. "
                }
              </p>
            </div>
            <div className="imagehtmlcourse">
              <img src={csscourseimg} alt="" />
            </div>
          </div>
        </div>
      </div>
      <div className="javascript">
        <div className="javscriptext">
          <div className="titlejs">
          <div className="javascriptimg">
          <img src={jscourseimg} alt="" />
        </div>
            <h1 className="htmltitle">
              <span style={{ color: "rgb(255, 222, 37)" }}>{"<"}</span>
              {"Javascript/"}
              <span style={{ color: "rgb(255, 222, 37)" }}>{">"}</span>
            </h1>
            <p>
              <span style={{ color: "rgb(255, 222, 37)" }}>
                {"HTML (Hypertext Markup Language)"}
              </span>
              {
                " is a high-level, dynamic programming language primarily used to create interactive and dynamic content on websites. It enables developers to add functionality to web pages, such as responding to user inputs, handling events, manipulating the DOM (Document Object Model), and communicating with servers via APIs.  "
              }
            </p> 
          </div>
        </div>
        
        <div className="javascriptsample"></div>
      </div>
      <div className="frontendtitle">
        <img className="fronticon" src={frontendicon} alt="" />
        <h1 className="fronttitle">Back-End</h1>
        <img className="fronticon" src={frontendicon} alt="" />
      </div>
      <div className="php">
      <div className="javascriptimg">
          <img src={phpcourse} alt="" />
        </div>
        <div className="phptext">
       
          <div className="titlejs">
            <h1 className="htmltitle">
              <span style={{ color: "rgb(137, 147, 190)" }}>{"<?"}</span>
              {"PHP"}
              <span style={{ color: "rgb(137, 147, 190)" }}>{"?>"}</span>
            </h1>
            <p>
              <span style={{ color: "rgb(137, 147, 190)" }}>
                {"PHP (Hypertext Preprocessor)"}
              </span>
              {
                " is a server-side scripting language designed specifically for web development. It is used to create dynamic web pages that can interact with databases, manage session data, handle forms, and perform a variety of other server-side tasks. When a user requests a PHP page, the server processes the PHP code and sends the generated HTML back to the user's browser "
              }
            </p> 
          </div>
        </div>
       
        <div className="javascriptsample"></div>
      </div>  
    </div>
  );
}
export default Course;
