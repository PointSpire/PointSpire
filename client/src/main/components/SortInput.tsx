import React from 'react';
import { Select, MenuItem, InputLabel, FormControl } from '@material-ui/core';
import sortingFunctions from '../logic/sortingFunctions';

export type SortInputProps = {
  setSortBy: (sortBy: string) => void;
  sortBy: string;
};

/**
 * Represents a sorting input dropdown which uses the sorting types available
 * in the `sortingFunctions` file. This could potentially be changed to a
 * native sorting list.
 *
 * @param {SortInputProps} props the props for the component
 */
function SortInput(props: SortInputProps): JSX.Element {
  const { setSortBy, sortBy } = props;

  function handleChange(event: React.ChangeEvent<{ value: unknown }>): void {
    setSortBy(event.target.value as string);
  }

  return (
    <FormControl>
      <InputLabel id="sort-label">Sort By</InputLabel>
      <Select labelId="sort-label" value={sortBy} onChange={handleChange}>
        {Object.keys(sortingFunctions).map(sortType => {
          return (
            <MenuItem key={sortType} value={sortType}>
              {sortType}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

export default SortInput;
