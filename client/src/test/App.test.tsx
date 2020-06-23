import React from 'react';
import { render } from '@testing-library/react';
import App from '../main/App';
import '@testing-library/jest-dom/extend-expect';

test('renders pointspire title', () => {
  const { getAllByText } = render(<App />);
  const pointSpireElements = getAllByText(/PointSpire/i);
  expect(pointSpireElements.length > 0).toBeTruthy();
});
