import "./HomeContent.css";
import React from "react";
import elevateimg from "./images/elevateimg.png";
import welcomeimg from "./images/welcomeimg.png";
import forum from "./images/forum.png";
import playground from "./images/playground.png";
import game from "./images/game.png";
import { useNavigate } from "react-router";

function HomeContent() {
  const navigate = useNavigate();
  return (
    <div className="parent">
      <div className="elevate">
        <div className="elevateleft">
          <div className="elevatealltext">
            <h1 className="elevatetext">
              Elevate Your Learning Potential With CodeCraft
            </h1>
            <p className="details1">
              Code your way to success with CodeCraft. Empower your journey with
              innovative coding solutions, teacher guidance and a community of
              passionate learners dedicated into Web Development
            </p>
          </div>
          <div className="buttonselevate">
            <button
              className="startLearning"
              onClick={() => navigate("/login")}
            >
              Start Learning Now
            </button>
            <button className="learnmore" onClick={() => navigate("/about")}>
              Learn More
            </button>
          </div>
        </div>
        <div className="elevateright">
          <img className="elevaterightimg" src={elevateimg} alt="Elevate" />
        </div>
      </div>

      <div className="welcome">
        <div className="welcomeleft">
          <img src={welcomeimg} alt="Welcome" />
        </div>
        <div className="welcomeright">
          <h1 className="welcometitle">
            Welcome to the E-Learning Platform CodeCraft
          </h1>
          <p className="details">
            Join Code Craft to take your web development skills to the next
            level. Immerse yourself in hands-on practice, delve into the latest
            techniques, and work alongside a dynamic community of students and
            experienced teachers. Whether you're looking to master new
            technologies, refine your coding abilities, or connect with
            like-minded individuals.
          </p>

          <form>
            <label className="radiotext">
              <input
                type="checkbox"
                name="option"
                value="gamification"
                defaultChecked
              />
              <span></span>
              Gamification
            </label>
            <br />
            <label className="radiotext">
              <input
                type="checkbox"
                name="option"
                value="community"
                defaultChecked
              />
              <span></span>
              Community
            </label>
            <br />
            <label className="radiotext">
              <input
                type="checkbox"
                name="option"
                value="playground"
                defaultChecked
              />
              <span></span>
              Playground
            </label>
          </form>
        </div>
      </div>

      <div className="features">
        <div className="titlefeatures">
          <h1 className="featureTitle">CodeCraft Features</h1>
        </div>
        <div className="featuresContent">
          <div className="gamification">
            <img className="featureimg" src={game} alt="" />
            <h1 className="featurestitle">Gamification</h1>
            <p className="featuredetail">
              Students will earn EXP points by actively participating in
              lessons, completing quizzes, and engaging in various educational
              activities. These points will not only foster a sense of
              competition among students but also serve as a motivator for
              continuous learning and improvement.
            </p>
          </div>

          <div className="playground">
            <img className="featureimg" src={playground} alt="" />
            <h1 className="featurestitle">Playground IDE</h1>
            <p className="featuredetail">
              Users can directly share their code creations from the playground
              with the community, fostering an atmosphere of collaboration and
              knowledge sharing. This feature allows learners to showcase their
              projects, receive feedback, and inspire others with their
              innovative solutions.
            </p>
          </div>

          <div className="forum">
            <img className="featureimg" src={forum} alt="" />
            <h1 className="featurestitle">Community Forum</h1>
            <p className="featuredetail">
              Code Craft features robust community engagement through a
              dedicated page designed specifically for learners. On this page,
              students can ask and answer questions, share knowledge, and
              participate in meaningful discussions with peers and mentors.{" "}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeContent;
