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
import {
  AlertFunction,
  UpdateSettingsFunction,
  UpdateUserOnServerFunction,
} from '../App';
import { UserSettings } from '../dbTypes';

type SettingsDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  alert: AlertFunction;
  settings: UserSettings;
  updateSettings: UpdateSettingsFunction;
  sendUpdatedUserToServer: UpdateUserOnServerFunction;
};

type SettingsDialogState = unknown;

/**
 * Represents the settings dialog for a user.
 */
export default class SettingsDialog extends React.Component<
  SettingsDialogProps,
  SettingsDialogState
> {
  descriptionElementRef = createRef<HTMLElement>();

  constructor(props: SettingsDialogProps) {
    super(props);
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

  /**
   * Handles closing of the SettingsDialog.
   */
  handleClose(): void {
    const { setOpen } = this.props;
    setOpen(false);
  }

  /**
   * Handles saving of the user settings.
   */
  handleSave(): void {
    const { setOpen, alert, sendUpdatedUserToServer } = this.props;
    setOpen(false);
    // Save their settings
    sendUpdatedUserToServer()
      .then(success => {
        if (success) {
          // Show the success snackbar 😀
          alert('success', 'Successfully saved settings!');
        } else {
          alert('error', 'Failed to save settings on the server');
        }
      })
      .catch(() => {
        alert('error', 'There was an error while saving the settings');
      });
  }

  /**
   * Handles changing of a checkbox by making the toggling the associated
   * setting for the user.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event the event passed in by
   * the element this handler is attached to
   */
  handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, checked } = event.target;
    const { settings, updateSettings } = this.props;
    if (settings && updateSettings) {
      settings[name] = checked;
      updateSettings(settings);
    }
  }

  render(): JSX.Element {
    const { open, settings } = this.props;
    const {
      handleClose,
      handleSave,
      handleCheckboxChange,
      descriptionElementRef,
    } = this;

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
            <Typography variant="h5" component="h3">
              Display
            </Typography>
            <FormGroup row={false}>
              <FormControlLabel
                label="Yellow and Green Tasks"
                control={
                  <Checkbox
                    checked={settings.yellowGreenTasks}
                    color="primary"
                    name="yellowGreenTasks"
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
