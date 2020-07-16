import React from 'react';
import ProjectTable from '../components/ProjectTable';

export type IndexRouteProps = {
  projectIds: Array<string> | null;
};

function IndexRoute(props: IndexRouteProps) {
  const { projectIds } = props;

  return <>{projectIds && <ProjectTable />}</>;
}

export default IndexRoute;
