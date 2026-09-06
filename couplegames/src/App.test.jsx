import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

async function startLocalGame(user) {
  await user.click(screen.getByRole('button', { name: /Play on one phone/i }))
  await user.type(screen.getByPlaceholderText(/Who picks lunch/i), 'Winner picks dinner')
  await user.click(screen.getByRole('button', { name: /Continue/i }))
}

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Landing', () => {
    it('renders the landing screen with title', () => {
      render(<App />)
      expect(screen.getByText("Couple's Challenge")).toBeInTheDocument()
      expect(screen.getByText(/10 challenges/i)).toBeInTheDocument()
    })

    it('shows play on one phone option', () => {
      render(<App />)
      expect(screen.getByRole('button', { name: /Play on one phone/i })).toBeInTheDocument()
    })
  })

  describe('Setup and start flow', () => {
    it('starts local game with default names', async () => {
      const user = userEvent.setup()
      render(<App />)
      await startLocalGame(user)
      await waitFor(() => {
        expect(screen.getByText(/Game 1 of 10/i)).toBeInTheDocument()
      })
      expect(screen.getByText(/Kenny/)).toBeInTheDocument()
      expect(screen.getByText(/Katie/)).toBeInTheDocument()
    })

    it('allows customizing player names', async () => {
      const user = userEvent.setup()
      render(<App />)
      await user.click(screen.getByRole('button', { name: /Play on one phone/i }))
      const inputs = screen.getAllByPlaceholderText('Name')
      await user.clear(inputs[0])
      await user.type(inputs[0], 'Alex')
      await user.clear(inputs[1])
      await user.type(inputs[1], 'Sam')
      await user.type(screen.getByPlaceholderText(/Who picks lunch/i), 'Pick the movie')
      await user.click(screen.getByRole('button', { name: /Continue/i }))
      await waitFor(() => {
        expect(screen.getByText(/Alex/)).toBeInTheDocument()
        expect(screen.getByText(/Sam/)).toBeInTheDocument()
      })
    })

    it('requires a prize before continuing', async () => {
      const user = userEvent.setup()
      render(<App />)
      await user.click(screen.getByRole('button', { name: /Play on one phone/i }))
      expect(screen.getByRole('button', { name: /Continue/i })).toBeDisabled()
      await user.type(screen.getByPlaceholderText(/Who picks lunch/i), 'Winner picks dinner')
      expect(screen.getByRole('button', { name: /Continue/i })).toBeEnabled()
    })
  })

  describe('Game flow', () => {
    it('displays first challenge after starting', async () => {
      const user = userEvent.setup()
      render(<App />)
      await startLocalGame(user)
      await waitFor(() => {
        expect(screen.getByText('Perfect Cut')).toBeInTheDocument()
      })
    })

    it('shows measurement entry for Perfect Cut', async () => {
      const user = userEvent.setup()
      render(<App />)
      await startLocalGame(user)
      await waitFor(() => {
        expect(screen.getByText(/Side length/i)).toBeInTheDocument()
      })
    })
  })

  describe('Scorekeeper', () => {
    it('shows measurement inputs on measure challenges', async () => {
      const user = userEvent.setup()
      render(<App />)
      await startLocalGame(user)
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter in/i)).toBeInTheDocument()
      })
    })
  })
})
