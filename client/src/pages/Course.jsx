import "./Course.css";
import htmlcourse from "./images/htmlcourse.png";
import csscourseimg from "./images/csscourse.png";
import jscourseimg from "./images/javascriptcourse.png";
import phpcourse from "./images/phpcourse.png";
import forum from "./images/forum.png";
import playground from "./images/playground.png";
import game from "./images/game.png";
import announcements from "./images/promotion.png";
import assignments from "./images/assignmentfeature.png";
import rank from "./images/star.png";
import { useNavigate } from "react-router";
function Course() {
  const navigate = useNavigate();
  return (
    <div className="parent">
      <div className="firstcontainer">
        <div className="firsttexts">
          <h1 className="find">Find Your Perfect Learning Platform</h1>
          <p className="firstdetails">
            With CodeCraft, you’ll not only understand programming concepts but
            apply them in meaningful ways, building the confidence to tackle
            challenges, innovate, and pursue endless career opportunities. Take
            control of your future and transform your potential with CodeCraft
            today.
          </p>
        </div>
        <div className="coursebutton">
          <button className="join" onClick={() => navigate('/signup')}>Join Us</button>
          <button className="learnmorecourse" onClick={() => navigate('/about')}>Learn More</button>
        </div>
      </div>
      <div className="secondcontainer">
        <div className="coursescontainer">
          <h1 className="ourtitle">Our Courses</h1>
          <div className="coursescontainer2">
            <div className="html">
              <img className="course" src={htmlcourse} alt="HTML Course" />
            </div>
            <hr className="vertical-hr" />
            <div className="css">
              <img className="coursecss" src={csscourseimg} alt="CSS Course" />
            </div>
            <hr className="vertical-hr" />
            <div className="js">
              <img
                className="course"
                src={jscourseimg}
                alt="Javascript Course"
              />
            </div>
            <hr className="vertical-hr" />
            <div className="php">
              <img className="course" src={phpcourse} alt="PHP Course" />
            </div>
          </div>
        </div>
      </div>

      <div className="explore">
        <h1 className="exploretitle">Explore More of Our Features</h1>
        <p className="exploredetails">
          Students earn EXP points through lessons, quizzes, and activities.
          Code Craft also features community discussions and the ability to
          share code from the playground, promoting collaboration and knowledge
          sharing.
        </p>
      </div>

      <div className="featurescontainer">
        <div className="featuresright">
          <div className="rightsidefeature">
            <div className="rightimgcontainer">
              <img className="featurerightimg" src={playground} alt="" />
            </div>
            <div className="rightsidetext">
              <h1 className="rightsidetitle">Gamification</h1>
              <p className="rightsidedesc">
                Students will earn EXP points through active participation in
                lessons, completing quizzes, and engaging in various educational
                activities. These points will not only encourage healthy
                competition among students but also act as a motivator for
                ongoing learning and improvement.
              </p>
            </div>
          </div>
          <div className="rightsidefeature">
            <div className="rightimgcontainer">
              <img className="featurerightimg" src={forum} alt="" />
            </div>
            <div className="rightsidetext">
              <h1 className="rightsidetitle">Forum</h1>
              <p className="rightsidedesc">
                Users can share their code creations from the playground
                directly with the community, promoting a collaborative
                environment for knowledge sharing. This feature enables learners
                to showcase their projects, receive feedback, and inspire others
                with their innovative solutions.
              </p>
            </div>
          </div>
          <div className="rightsidefeature">
            <div className="rightimgcontainer">
              <img className="featurerightimg" src={game} alt="" />
            </div>
            <div className="rightsidetext">
              <h1 className="rightsidetitle">Community Forums</h1>
              <p className="rightsidedesc">
                Users can share their code creations from the playground
                directly with the community, promoting a collaborative
                environment for knowledge sharing. This feature enables learners
                to showcase their projects, receive feedback, and inspire others
                with their innovative solutions.
              </p>
            </div>
          </div>
        </div>
        <div className="featuresleft">
          <div className="leftcontainer">
            <div className="leftimgcontainer">
              <img className="leftfeatureimg" src={announcements} alt="" />
            </div>
            <div className="lefttextcontainer">
              <h1 className="leftsidetitle">Announcements</h1>
              <p>
                Teachers make important announcements that are crucial for the
                learning process, and students typically view these
                announcements prominently displayed within the system. This
                ensures that all learners are informed about updates, deadlines,
                and any relevant information related to their courses.
              </p>
            </div>
          </div>
          <div className="leftcontainer">
            <div className="leftimgcontainer">
              <img className="leftfeatureimg" src={assignments} alt="" />
            </div>
            <div className="lefttextcontainer">
              <h1 className="leftsidetitle">Assignments</h1>
              <p className="leftsidesc">
                Teachers assign various assignments, which students can then
                submit through the system. This process facilitates organized
                workflow and ensures that all submissions are collected in one
                place, making it easier for both teachers and students to manage
                deadlines and track progress.{" "}
              </p>
            </div>
          </div>
          <div className="leftcontainer">
            <div className="leftimgcontainer">
              <img className="leftfeatureimg" src={rank} alt="" />
            </div>
            <div className="lefttextcontainer">
              <h1 className="leftsidetitle">Student Ranking</h1>
              <p className="leftsidesc">
                Students are ranked based on their points and progress within
                the system, creating a competitive environment that encourages
                engagement and achievement. This ranking system allows learners
                to see how they compare to their peers, motivating them to
                actively participate in lessons, complete assignments, and
                contribute to discussions.{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Course;
