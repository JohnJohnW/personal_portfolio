import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
  render(<App />);
  const heading = screen.getByText(/Welcome to My Portfolio/i);
  expect(heading).toBeInTheDocument();
});
