import "./HomeContent.css";
import React from "react";
import elevateimg from "./images/elevateimg.png";
import welcomeimg from "./images/welcomeimg.png";
import forum from "./images/forum.png";
import playground from "./images/playground.png";
import game from "./images/game.png"

function HomeContent() {
  return (
    <div className="parent">
      <div className="elevate">
        <div className="elevateleft">
          <div className="elevatealltext">
            <h1 className="elevatetext">
              Elevate Your Learning Potential With CodeCraft
            </h1>
            <p className="details1">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem
              laborum sint, aspernatur molestiae autem vel non, exercitationem
              id perspiciatis ullam vero delectus quia quasi similique ipsum a
              laudantium architecto dolor?
            </p>
          </div>
          <div className="buttonselevate">
            <button className="startLearning">Start Learning Now</button>
            <button className="learnmore">Learn More</button>
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
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nobis iste
            commodi distinctio minima minus? Similique dolorem vitae, ut debitis
            minus aliquam sed, blanditiis ratione repellendus officia soluta
            distinctio, commodi asperiores.
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
            <p className="featuredetail">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Error, itaque quod! Minus perferendis similique nam beatae dolor, molestias inventore libero est doloremque, culpa laboriosam nihil, repellat eveniet labore assumenda praesentium.</p>
          </div>

          <div className="playground">
            <img className="featureimg" src={playground} alt="" />
            <h1 className="featurestitle">Playground IDE</h1>
            <p className="featuredetail">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatum tenetur omnis sequi laudantium quod quasi hic placeat a, dolorem quas, iure at aperiam in est corporis pariatur eveniet minus quidem.</p>
          </div>


          <div className="forum">
            <img className="featureimg" src={forum} alt="" />
            <h1 className="featurestitle">Community Forum</h1>
            <p className="featuredetail">Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi corrupti laudantium quod maiores, doloremque accusantium deserunt soluta? Quas soluta tenetur rerum adipisci perferendis, dolor fugit odio, atque dolores voluptatem rem?</p>
          </div>
        </div>

      </div>





    </div>
  );
}

export default HomeContent;
