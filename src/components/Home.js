import React from 'react';
import Projects from './Projects'; // Assuming Projects component is in a separate file

function Home() {
  return (
    <div className="home">
      <div className="welcome-section">
        <h1>Welcome to My Portfolio</h1>
        <div className="typewriter">
          <p>Hi, I'm John Wynter, a passionate Law and IT student.</p>
        </div>
      </div>
      <div className="skills-section fade-in">
        <h2>Technologies</h2>
        <div className="skills">
          <div className="skill">
            <i className="fab fa-html5"></i>
            <p>HTML5</p>
          </div>
          <div className="skill">
            <i className="fab fa-css3-alt"></i>
            <p>CSS3</p>
          </div>
          <div className="skill">
            <i className="fab fa-js-square"></i>
            <p>JavaScript</p>
          </div>
          <div className="skill">
            <i className="fab fa-react"></i>
            <p>React</p>
          </div>
          <div className="skill">
            <i className="fab fa-react"></i>
            <p>Python</p>
          </div>
          <div className="skill">
            <i className="fab fa-react"></i>
            <p>SQL</p>
          </div>
        </div>
      </div>
      <div className="portfolio-preview">
        <Projects /> {/* Replace static project cards with the Projects component */}
      </div>
      <div className="contact-prompt fade-in">
        <h2>Let's Get In Touch</h2>
        <p>If you would like to collaborate or just want to say hi, feel free to contact me!</p>
        <a href="/contact" className="contact-button">Contact Me</a>
      </div>
    </div>
  );
}

export default Home;
