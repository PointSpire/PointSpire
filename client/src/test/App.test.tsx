import React from 'react';
import { render } from '@testing-library/react';
import App from '../main/App';
import '@testing-library/jest-dom/extend-expect';

test('renders pointspire title', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/PointSpire/i);
  expect(linkElement).toBeInTheDocument();
});
