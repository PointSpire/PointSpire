import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MobileContext } from '../utils/contexts';

interface MobileProviderProps {
  mobile: boolean;
  children: ReactNode;
}

/**
 * Provides the MobileContext, and the `BrowoserRouter` from React Router to
 * children of this coomponent.
 */
function MobileProvider(props: MobileProviderProps) {
  const { mobile, children } = props;
  return (
    <MobileContext.Provider value={mobile}>
      <BrowserRouter>{children}</BrowserRouter>
    </MobileContext.Provider>
  );
}

export default MobileProvider;
