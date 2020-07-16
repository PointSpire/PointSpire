import React from 'react';
import { useHistory } from 'react-router-dom';

type UnstyledLinkProps = {
  to: string;
  children: React.ReactNode;
};

function UnstyledLink(props: UnstyledLinkProps) {
  const { to, children } = props;
  const history = useHistory();

  function onClickHandler() {
    history.push(to);
  }

  return (
    <div onClick={onClickHandler} role="button" aria-hidden="true">
      {children}
    </div>
  );
}

export default UnstyledLink;
