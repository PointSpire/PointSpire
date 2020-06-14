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
import { AlertFunction } from '../App';

type SettingsDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  alert: AlertFunction;
};

type SettingsDialogState = {
  settingYellowGreen: boolean;
  snackbarOpen: boolean;
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
      snackbarOpen: false,
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
    const { setOpen, alert } = this.props;
    setOpen(false);
    // Save their settings

    // Show the success snackbar 😀
    alert('success', 'Successfully saved settings!');
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
                label="Yellow and Green Tasks"
                control={
                  <Checkbox
                    checked={settingYellowGreen}
                    color="primary"
                    name="settingYellowGreen"
                    onChange={handleCheckboxChange}
                  />
                }
              />
              <Typography variant="caption" display="block">
                Enabling this option makes it so tasks that have a pre-requisite
                are yellow and tasks that can be worked on are green. If this
                option is disabled, then tasks that have a pre-requisite are
                grayed out, and tasks that can be worked on have a normal white
                background.
              </Typography>
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
