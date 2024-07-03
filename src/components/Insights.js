import React, { useState } from 'react';

function Insights() {
  const [currentArticle, setCurrentArticle] = useState(0);
  const [currentVideo, setCurrentVideo] = useState(0);

  const articles = [
    { title: "Center Embedding in Legalese", description: "Implications and Strategies for Law Firms", link: "/article1" },
    { title: "Ethics and Regulation of AI in Predictive Policing", description: "Balancing Innovation and Privacy", link: "/article2" },
    { title: "The Role of Blockchain in Shareholder Voting", description: "An Australian Perspective", link: "/article3" }
  ];

  const videos = [
    { title: "Center Embedding in Legalese", description: "Implications and Strategies for Law Firms", link: "https://example.com/intro-react" },
    { title: "Ethics and Regulation of AI in Predictive Policing", description: "Balancing Innovation and Privacy", link: "https://example.com/advanced-js" },
    { title: "The Role of Blockchain in Shareholder Voting", description: "An Australian Perspective", link: "https://example.com/css-flexbox" }
  ];

  const nextArticle = () => setCurrentArticle((currentArticle + 1) % articles.length);
  const prevArticle = () => setCurrentArticle((currentArticle - 1 + articles.length) % articles.length);
  const nextVideo = () => setCurrentVideo((currentVideo + 1) % videos.length);
  const prevVideo = () => setCurrentVideo((currentVideo - 1 + videos.length) % videos.length);

  return (
    <div className="insights">
      <h1>My Insights</h1>
      
      <div className="articles-section">
        <h2>Articles</h2>
        <div className="carousel">
          <button onClick={prevArticle}>&lt;</button>
          <div className="article-card">
            <h2 className="article-title">{articles[currentArticle].title}</h2>
            <p>{articles[currentArticle].description}</p>
            <a href={articles[currentArticle].link}>Read Article</a>
          </div>
          <button onClick={nextArticle}>&gt;</button>
        </div>
      </div>

      <div className="videos-section">
        <h2>Videos</h2>
        <div className="carousel">
          <button onClick={prevVideo}>&lt;</button>
          <div className="video-card">
            <h2 className="video-title">{videos[currentVideo].title}</h2>
            <p>{videos[currentVideo].description}</p>
            <a href={videos[currentVideo].link} target="_blank" rel="noopener noreferrer">Watch Video</a>
          </div>
          <button onClick={nextVideo}>&gt;</button>
        </div>
      </div>
    </div>
  );
}

export default Insights;
