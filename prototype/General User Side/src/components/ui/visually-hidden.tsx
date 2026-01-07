import React from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function VisuallyHidden({ children, asChild = false }: VisuallyHiddenProps) {
  const Component = asChild ? React.Fragment : 'span';
  
  const visuallyHiddenStyle = {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    border: '0',
  };

  if (asChild) {
    return (
      <>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {
                ...child.props,
                style: { ...child.props.style, ...visuallyHiddenStyle },
              })
            : child
        )}
      </>
    );
  }

  return (
    <Component style={visuallyHiddenStyle}>
      {children}
    </Component>
  );
}