import "./HomeContent.css";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import htmlicon from "./images/html.png";
import cssicon from "./images/css.png";
import jsicon from "./images/javascript.png";
import gamification from "./images/gamification.png";
import IDE from "./images/ide.png";
import community from "./images/Communityf.png";
import wantmoreimg from "./images/want.png";
function HomeContent() {
  return (
    <div className="allcontent">
      <div className="level">
        <h1>
          <span style={{ color: "rgb(255, 200, 55)" }}>{"<"}</span>
          {"Level Up Your Coding Skills/"}
          <span style={{ color: "rgb(255, 200, 55)" }}>{">"}</span>
        </h1>
      </div>

      <div className="codeyourway">
        <div className="textcode">
          <p>
            Code your way to success with CodeCraft. Empower your journey with
            innovative coding solutions, teacher guidance and a community of
            passionate learners dedicated into Web Development
          </p>
        </div>
      </div>

      <div className="buttonstartlearning">
        <button className="button-homecontent">
          <NavLink to="login">
            Start Learning Now <span>&#8594;</span>
          </NavLink>
        </button>
      </div>

      <div className="courses">
        <div className="container">
          <div className="coursestitle">
            <h1>{"<Courses/>"}</h1>
          </div>
          <div className="coursescontainer">
            <div className="html">
              <h1 className="containertitlehtml">
                Hypertext Markup Language (HTML)
              </h1>
          
              <div className="thirdcontainer">
                <div className="texthtml">
                  <p>
                    The core language used to structure and display content on
                    the web. It uses tags to define elements like headings,
                    paragraphs, links, and images. Browsers interpret these tags
                    to render content visually
                  </p>
                </div>
                <div className="htmlimage">
                  <img className="htmlactimage" src={htmlicon} alt="" />
                </div>
              </div>
              <div className="coursebutton">
                <button className="button-homecontent">
                  <NavLink to="login">
                    Check out <span>&#8594;</span>
                  </NavLink>
                </button>
              </div>
            </div>

            <div className="css">
              <h1 className="containertitlehtml">
                Cascading Style Sheet (CSS)
              </h1>

           
              <div className="thirdcontainer">
                <div className="texthtml">
                  <p>
                    This controls the visual appearance of HTML elements, such
                    as colors, fonts, spacing, and positioning. By separating
                    content from design, CSS allows for more flexible and
                    maintainable web development.
                  </p>
                </div>
                <div className="htmlimage">
                  <img className="htmlactimage" src={cssicon} alt="" />
                </div>
              </div>
              <div className="coursebutton">
                <button className="button-homecontent">
                  <NavLink to="login">
                    Check out <span>&#8594;</span>
                  </NavLink>
                </button>
              </div>
            </div>
            <div className="js">
              <h1 className="containertitlehtml">Javascript (JS)</h1>

              <div className="thirdcontainer">
                <div className="texthtml">
                  <p>
                    This controls the visual appearance of HTML elements, such
                    as colors, fonts, spacing, and positioning. By separating
                    content from design, CSS allows for more flexible and
                    maintainable web development.
                  </p>
                </div>
                <div className="htmlimage">
                  <img className="jsactimage" src={jsicon} alt="" />
                </div>
              </div>
              <div className="coursebutton">
                <button className="button-homecontent">
                  <NavLink to="login">
                    Check out <span>&#8594;</span>
                  </NavLink>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="featurestitle">
        <h1>
          <span style={{ color: "rgb(255, 200, 55)" }}>{"<"}</span>
          {"Our Features/"}
          <span style={{ color: "rgb(255, 200, 55)" }}>{">"}</span>
        </h1>{" "}
      </div>
      <div className="features">
        <div className="featurescontainer">
          <div className="gamification">
            <img className="gamificationimg" src={gamification} alt="" />
            <h1 className="title">Gamification</h1>
            <p>
              Students will earn EXP points by participating lessons, quizes and
              activities promoting competition and skill development
            </p>
          </div>
          <div className="IDE">
            <img className="gamificationimg" src={IDE} alt="" />
            <h1 className="title">Playground</h1>
            <p>
              Users can directly share their code creations from the playground
              with the community, fostering collaboration and knowledge sharing.
            </p>
          </div>
          <div className="community">
            <img className="gamificationimg" src={community} alt="" />
            <h1 className="title">Playground</h1>
            <p>
              Code Craft features community engagement through a dedicated page
              for learners to ask and answer questions and participate in
              discussions
            </p>
          </div>
        </div>
      </div>
      <div className="wanttoknow">
        <div className="wanttext">
          <h1 className="wanttitle">Want to Know More? </h1>
          <p className="detail">
            Join Code Craft to take your web development skills to the next
            level. Immerse yourself in hands-on practice, delve into the latest
            techniques, and work alongside a dynamic community of students and
            experienced teachers. Whether you're looking to master new
            technologies, refine your coding abilities, or connect with
            like-minded individuals.
          </p>
          <button className="button-homecontent">
            <NavLink to="login">
              Start Learning Now <span>&#8594;</span>
            </NavLink>
          </button>
        </div>

        <div className="wantimg">
          <img className="wantmoreimg" src={wantmoreimg} alt="" />
        </div>
      </div>
    </div>
  );
}
export default HomeContent;
