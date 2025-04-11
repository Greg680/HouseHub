import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { MemoryRouter } from 'react-router-dom';
import LoginCard from '../components/login/LoginCard';

// Mock JoinHouseCard for testing, simply returning a div with a test id for checking render
jest.mock('../components/login/JoinHouseCard', () => () => (
  <div data-testid="join-house-card">Join House</div>
));

// Need to wrap with memoryrouter for navigation
const renderWithRouter = () => {
  return render(<MemoryRouter><LoginCard /></MemoryRouter>);
};

describe('LoginCard Component', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
    localStorage.clear();
  });
  // Checking that component appears
  test('renders login form', () => {
    renderWithRouter();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
// tetsing for input fields
  test('can type into username and password fields', () => {
    renderWithRouter();
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });
// Navigation testing upon successful login
  test('navigates to dashboard on successful login', async () => {
    const token = 'fakeToken123';
    mock.onPost('/api/user/login').reply(200, {
      message: 'Login successful',
      token,
    });

    renderWithRouter();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'testpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe(token);
    });
  });
  // Testing if response is "RHP" joinHouse card renders with mock one from top of file
  test('renders JoinHouseCard if response message is "RHP"', async () => {
    mock.onPost('/api/user/login').reply(200, {
      message: 'RHP',
    });

    renderWithRouter();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'testpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByTestId('join-house-card')).toBeInTheDocument();
    });
  });

  test('handles failed login attempt', async () => {
    console.error = jest.fn();
    // Mocking
    mock.onPost('/api/user/login').reply(500);

    renderWithRouter();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'testpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error logging in:'),
        expect.anything()
      );
    });

    console.error.mockRestore(); // Reset mock
  });
});
