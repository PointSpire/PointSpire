import React from 'react';
import Debug from 'debug';
import { useHistory } from 'react-router-dom';

const debug = Debug('BreadCrumb.tsx');
debug.enabled = true;

function BreadCrumb() {
  const history = useHistory();
  debug(history.location);
  return <div>Test</div>;
}

export default BreadCrumb;
