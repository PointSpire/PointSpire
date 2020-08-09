import React from 'react';
import Debug from 'debug';
import { InputBase } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { MobileContext } from '../utils/contexts';
import SimpleTextInput from './CompletableTable/CompletableRow/SimpleTextInput';
import { CompletableType } from '../utils/dbTypes';
import capitalizeFirstLetter from '../utils/stringFunctions';
import Completables from '../models/Completables';

const debug = Debug('CompletableTitle.tsx');
debug.enabled = true;

export type CompletableTitleProps = {
  completableId: string;
  completableType: CompletableType;
  className?: string;
};

/**
 * Represents a completable title. This uses the `MobileContext` to determine
 * if a `SimpleTextInput` should be used or a button for the title which
 * routes to the `CompletableDetails` component.
 *
 * If this component should be a text input no matter what, then the
 * `SimpletTextInput` should be used instead.
 */
function CompletableTitle(props: CompletableTitleProps) {
  const { completableId, completableType, className } = props;

  const history = useHistory();

  const completableTitle = Completables.get(completableType, completableId)
    .title;

  function handleClick() {
    history.push(`/c/${completableType}/${completableId}`);
  }

  const textInputLabel = `${capitalizeFirstLetter(completableType)} Title`;
  return (
    <MobileContext.Consumer>
      {mobile =>
        mobile ? (
          <InputBase readOnly value={completableTitle} onClick={handleClick} />
        ) : (
          <SimpleTextInput
            className={className}
            completableId={completableId}
            completableType={completableType}
            completablePropertyName="title"
            label={textInputLabel}
          />
        )
      }
    </MobileContext.Consumer>
  );
}

export default CompletableTitle;
