import React, { useState } from 'react';

function Projects() {
  const [currentProject, setCurrentProject] = useState(0);
  const projects = [
    { title: "Contract Clause Library", description: "Browse, search, and organize legal clauses into documents. Manage and utilise a library of predefined contract clauses.", link: "https://johnjohnw.github.io/contract_clause_library/" },
  ];

  const nextProject = () => setCurrentProject((currentProject + 1) % projects.length);
  const prevProject = () => setCurrentProject((currentProject - 1 + projects.length) % projects.length);

  return (
    <div className="projects">
      <h1>My Projects</h1>
      <div className="carousel">
        <button onClick={prevProject}>&lt;</button>
        <div className="project-card">
          <h2>{projects[currentProject].title}</h2>
          <p>{projects[currentProject].description}</p>
          <a href={projects[currentProject].link} target="_blank" rel="noopener noreferrer">View Project</a>
        </div>
        <button onClick={nextProject}>&gt;</button>
      </div>
    </div>
  );
}

export default Projects;
