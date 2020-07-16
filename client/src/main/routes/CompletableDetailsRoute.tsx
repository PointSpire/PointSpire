/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Theme, createStyles, withStyles } from '@material-ui/core';
import CompletedCheckbox from '../components/CompletableRow/CompletedCheckbox';
import ClientData from '../logic/ClientData/ClientData';
import SimpleTextInput from '../components/SimpleTextInput';
import NoteInput from '../components/CompletableRow/NoteInput';
import DateInput from '../components/CompletableRow/DateInput';
import PriorityButton from '../components/PriorityButton/PriorityButton';
import ProjectTable from '../components/ProjectTable';

function styles(theme: Theme) {
  return createStyles({
    root: {
      display: 'flex',
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    flexGrow: {
      flexGrow: 1,
    },
    card: {
      flexGrow: 1,
      padding: theme.spacing(1),
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(1),
    },
    nested: {
      marginLeft: theme.spacing(2),
    },
    checkbox: {
      paddingRight: 0,
    },
  });
}

// export type CompletableDetailsRouteProps = {};

// eslint-disable-next-line import/prefer-default-export
function CompletableDetailsRoute() {
  const { completableType, completableId } = useParams();

  const [completable, setCompletable] = useState(
    ClientData.getCompletable(completableType, completableId)
  );

  const listenerId = `${completableId}.CompletableDetailRoute`;

  useEffect(() => {
    ClientData.addCompletableListener(
      completableType,
      completableId,
      listenerId,
      updatedCompletable => {
        if (updatedCompletable !== null) {
          if (completable === updatedCompletable) {
            // eslint-disable-next-line
            console.log(
              'Caution: Completable did not re-render because ' +
                'it is equal to the updated completable. You may want to make ' +
                'sure that the updated completable is an entirely new object.'
            );
          }
          // eslint-disable-next-line
          console.log(
            'Completable with ID: ',
            updatedCompletable._id,
            ' updated'
          );
          setCompletable(updatedCompletable);
        }
      }
    );

    // This will be ran when the compoennt is unmounted
    return function cleanup() {
      ClientData.removeCompletableListener(
        completableType,
        completableId,
        listenerId
      );
    };
  }, []);

  return (
    <>
      <div
        style={{ marginRight: '10px', marginLeft: '10px', marginTop: '10px' }}
      >
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="flex-start"
        >
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
            spacing={2}
          >
            <Grid item xs={2}>
              <CompletedCheckbox
                completableType={completableType}
                completable={completable}
              />
            </Grid>
            <Grid item xs={10}>
              <SimpleTextInput
                label={
                  completableType === 'project' ? 'Project Title' : 'Task Title'
                }
                completableType={completableType}
                completableId={completableId}
                completablePropertyName="title"
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
            spacing={2}
          >
            <Grid item xs={4}>
              <DateInput
                completablePropertyName="startDate"
                completableId={completableId}
                completableType={completableType}
                label="Start Date"
              />
            </Grid>
            <Grid item xs={4}>
              <DateInput
                completablePropertyName="dueDate"
                completableId={completableId}
                completableType={completableType}
                label="Due Date"
              />
            </Grid>
            <Grid item xs={4}>
              <PriorityButton
                completableType={completableType}
                completableId={completableId}
              />
            </Grid>
          </Grid>
          <NoteInput
            completableId={completableId}
            completableType={completableType}
            label="Note"
            rows={5}
          />
        </Grid>
      </div>
      <ProjectTable />
    </>
  );
}

export default withStyles(styles, { withTheme: true })(CompletableDetailsRoute);
