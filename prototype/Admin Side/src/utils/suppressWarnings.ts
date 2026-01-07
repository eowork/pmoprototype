// Utility to suppress known warnings from third-party libraries
export function suppressKnownWarnings() {
  // Suppress ref forwarding warnings from Radix UI components
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Suppress specific known warnings
    if (
      message.includes('Function components cannot be given refs') ||
      message.includes('SlotClone') ||
      message.includes('@radix-ui/react-slot') ||
      message.includes('Check the render method of `SlotClone`')
    ) {
      return; // Suppress these warnings
    }
    
    // Allow other warnings through
    originalConsoleWarn.apply(console, args);
  };

  console.error = (...args) => {
    const message = args.join(' ');
    
    // Suppress specific known errors from third-party libraries
    if (
      message.includes('Function components cannot be given refs') ||
      message.includes('SlotClone') ||
      message.includes('@radix-ui/react-slot')
    ) {
      return; // Suppress these errors
    }
    
    // Allow other errors through
    originalConsoleError.apply(console, args);
  };
}

// Call this function to activate warning suppression
if (typeof window !== 'undefined') {
  suppressKnownWarnings();
} else {
  // Also suppress in SSR context
  suppressKnownWarnings();
}