import { Component } from 'react'
import { debugLog } from '../utils/debugLog'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    debugLog('error-boundary', 'react-crash', {
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3).join('\n'),
      componentStack: errorInfo.componentStack?.split('\n').slice(0, 5).join('\n'),
    }, 'error')
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className={`flex flex-col items-center justify-center p-6 ${this.props.className || ''}`}>
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-base-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-base-content mb-1">
              {this.props.title || 'Something went wrong'}
            </h3>
            <p className="text-xs text-base-content/60 mb-4">
              {this.props.message || 'An error occurred while rendering this section.'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 text-xs font-medium text-primary-content bg-primary rounded hover:bg-primary/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
