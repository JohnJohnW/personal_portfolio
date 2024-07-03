import React, { useState } from 'react';

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const formData = {
        name,
        email,
        message,
      };

      // Replace with your own backend endpoint or handle email sending logic here

      // Example placeholder for async operation (like fetch to your backend)
      // const response = await fetch('/api/sendEmail', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });

      // Example placeholder for setting submission state
      // if (response.ok) {
      //   setIsSubmitted(true);
      //   setName('');
      //   setEmail('');
      //   setMessage('');
      // } else {
      //   alert('Failed to send message. Please try again later.');
      // }

      setIsSubmitted(true); // Simulate submission success
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="contact">
      <h1>Contact Me</h1>
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} action="https://formspree.io/f/mnnaakdp" method="POST">
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </label>
          <label>
            Message:
            <textarea
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              required
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      ) : (
        <div className="thank-you">
          <p>Thank you for your message!</p>
        </div>
      )}
    </div>
  );
}

export default Contact;
