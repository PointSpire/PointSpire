import React, { createRef } from 'react';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {
  Typography,
  Button,
  Dialog,
  FormGroup,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';

type SettingsDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

type SettingsDialogState = {
  settingYellowGreen: boolean;
};

export default class SettingsDialog extends React.Component<
  SettingsDialogProps,
  SettingsDialogState
> {
  descriptionElementRef = createRef<HTMLElement>();

  constructor(props: SettingsDialogProps) {
    super(props);
    this.state = {
      settingYellowGreen: true,
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
  }

  componentDidMount(): void {
    const { open } = this.props;
    if (open) {
      const { current: descriptionElement } = this.descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }

  handleClose(): void {
    const { setOpen } = this.props;
    setOpen(false);
  }

  handleSave(): void {
    const { setOpen } = this.props;
    setOpen(false);
    // Save their settings
  }

  handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, checked } = event.target;
    this.setState(state => {
      return {
        ...state,
        [name]: checked,
      };
    });
  }

  render(): JSX.Element {
    const { open } = this.props;
    const {
      handleClose,
      handleSave,
      handleCheckboxChange,
      descriptionElementRef,
    } = this;
    const { settingYellowGreen } = this.state;

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        scroll="paper"
        aria-labelledby="settings-dialog-title"
        aria-describedby="settings-dialog-description"
      >
        <DialogTitle id="settings-dialog-title">Settings</DialogTitle>
        <DialogContent dividers>
          <DialogContentText
            id="settings-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            <Typography variant="h5" component="h2">
              Display
            </Typography>
            <FormGroup row={false}>
              <FormControlLabel
                label="Make tasks yellow and green"
                control={
                  <Checkbox
                    checked={settingYellowGreen}
                    color="primary"
                    name="settingYellowGreen"
                    onChange={handleCheckboxChange}
                  />
                }
              />
            </FormGroup>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
