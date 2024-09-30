import "./about.css";
import imgfirst from "./images/imgabout.jpg"
import innovativeicon from "./images/innovative.png"
import comprehensive from "./images/comprehensive.png"
import handsonicon from "./images/handson.png"
import supporticon from "./images/support.png"
import morerightimg from "./images/right.png"

function About() {
  return (
    <div className="aboutpage">
      <div className="abouttitle">
        <h1>About Codecraft</h1>
      </div>
      <div className="aboutdescription">
        <p className="titledesc">Created by passionate developers, <span style={{ color: "rgb(255, 200, 55)" }}>{"<"}</span>
          {"Codecraft"}
          <span style={{ color: "rgb(255, 200, 55)" }}>{">"}</span> is an interactive learning platform designed to empower students at Batangas State University TNEU JPLPC Malvar</p>
      </div>
      
      <div className="firstimganddesc">
        <div className="imagefordesc">
        <img className="imageinthedesc" src={imgfirst} alt="" />
        </div>
        <div className="descoftheimg">
          <p>
          <span style={{ color: "rgb(255, 200, 55)" }}>{"<"}</span>
          {"Codecraft"}
          <span style={{ color: "rgb(255, 200, 55)" }}>{">"}</span> is an innovative e-learning platform that provides comprehensive and interactive coding education for learners of all levels. The platform offers a variety of courses covering essential programming languages and technologies, with a strong focus on hands-on learning through real-world examples, quizzes, and coding activities. Whether users are just starting their coding journey or looking to advance their skills.
            </p>
        </div>
      </div>
      <hr />
      <div className="whycodecraft">
        <h1>Why Codecraft</h1>
      </div>
      <div className="whycodedesc">
        <p>Thank you for considering us as you E-Learning Platform. We believe that our features will enhance the students skills in web development and dedication to programming.</p>
      </div>

    <div className="abouttwo">
      <div className="innovative">
        <img className="innoicon" src={innovativeicon} alt="" />
        <h1 className="innotitle">Innovative E-Learning Platform</h1>
        <p className="innodesc">We offer a modern and engaging approach to coding education, making learning accessible and effective for the learners.</p>
      </div>
      <div className="comprehensive">
        <img className="compicon" src={comprehensive} alt="" />
        <h1 className="competitle">Comprehensive Course Offerings</h1>
        <p className="compedesc">Provides a diverse range of courses covering essential programming languages and technologies, catering to various learning needs and interests.</p>
      </div>
      
      </div>
      <div className="aboutfour">
      <div className="handsonLearning">
        <img className="handicon" src={handsonicon} alt="" />
        <h1 className="handtitle">Hands-On Learning Focus</h1>
        <p> Emphasizes practical, real-world examples, quizzes, and coding activities to reinforce theoretical knowledge and ensure mastery of concepts.</p>
      </div>
      <div className="supportsall">
        <img className="suppicon" src={supporticon} alt="" />
        <h1 className="supporttitle">Supports All Skill Levels</h1>
        <p className="supportdesc">Designed for beginners starting their coding journey and experienced learners looking to deepen their understanding and enhance their skills.</p>
      </div>
      </div>
      <hr />
      <div className="more">
        <h1 className="moreabout">More About Codecraft</h1>
        </div>
      <div className="process">
        <div className="right">
          <div className="moreaboutitle">
          
          </div>
          <p className="our">Our platform emphasizes collaboration and knowledge sharing, providing a vibrant space where learners can connect and support one another. We continuously strive for improvement, refining our systems based on user feedback and industry standards to ensure an optimal learning experience. Through these efforts, CodeCraft aims to cultivate a dynamic community that thrives on innovation and collaboration.</p>
          <button>Check it Out</button>
          <img className="moreimgicon" src={morerightimg} alt="" />
        </div>
        
        </div>
<hr />
      <div className="thatsall">
        <h1>Feel free to try <span style={{ color: "rgb(255, 200, 55)" }}>{"<"}</span>
          {"Codecraft"}
          <span style={{ color: "rgb(255, 200, 55)" }}>{">"}</span> Now</h1>
          
      </div>
    

      <div className="excited">
      <p className="exciteddesc"><span style={{ color: "rgb(255, 200, 55)" }}>{"<"}</span>
          {"Codecraft"}
          <span style={{ color: "rgb(255, 200, 55)" }}>{">"}</span> is excited about the opportunity for the students to learn alot about web development</p>
          <button>START LEARNING</button>
      </div>
    </div>
  );
}
export default About;
