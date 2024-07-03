import React from 'react';

function About() {
  return (
    <div className="about">
      <h1>About Me</h1>
      <p>My name is John Wynter. I am a Law and IT student at Queensland University of Technology (QUT). I enjoy solving complex problems and turning ideas into reality. In my free time, I love exploring new technologies and working on personal projects.</p>
      
      <div className="timeline">
        <div className="timeline-container left">
          <div className="content">
            <h2>2022</h2>
            <p>Started my journey in Law and<br></br>Commerce at University of Newcastle.</p>
          </div>
        </div>
        <div className="timeline-container right">
          <div className="content">
            <h2>2023</h2>
            <p>Still enthused about commerce but became more passionate in IT so switched degrees and universities to study Law and IT at QUT</p>
          </div>
        </div>
        <div className="timeline-container left">
          <div className="content">
            <h2>2024</h2>
            <p>Began working in the field of Law as an administrative assistant.</p>
          </div>
        </div>
        <div className="timeline-container right">
          <div className="content">
            <h2>2025</h2>
            <p>Great things to come!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
