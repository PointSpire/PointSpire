import React from 'react';
import { Typography } from '@material-ui/core';
import { CompletableType } from '../../utils/dbTypes';

export interface HiddenItemsCaptionProps {
  numHiddenItems: number;
  completableType: CompletableType;

  /**
   * The class name that will be assigned to the text only if it should appear.
   * Otherwise this is ignored if there are no hidden items.
   */
  className?: string;
}

function HiddenItemsCaption(props: HiddenItemsCaptionProps): JSX.Element {
  const { numHiddenItems, completableType, className } = props;
  return (
    <>
      {numHiddenItems > 0 ? (
        <Typography variant="caption" className={className}>
          {`${numHiddenItems} ${completableType}${
            numHiddenItems > 1 ? 's' : ''
          } hidden from filters`}
        </Typography>
      ) : (
        ''
      )}
    </>
  );
}

export default HiddenItemsCaption;
