import React from 'react';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {
  Typography,
  Button,
  Dialog,
  FormGroup,
  Checkbox,
  FormControlLabel,
  createMuiTheme,
  List,
  ListItem,
} from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';
import {
  AlertFunction,
  UpdateSettingsFunction,
  UpdateUserOnServerFunction,
} from '../../App';
import { UserSettings } from '../../logic/dbTypes';
import FontSizeSetting from './FontSizeSetting';
import baseThemeOptions from '../../AppTheme';
import { setCookie, ClientCookies } from '../../logic/clientCookies';

type SettingsDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  alert: AlertFunction;
  settings: UserSettings;
  appTheme: Theme;
  setTheme: (updatedTheme: Theme) => void;
  updateSettings: UpdateSettingsFunction;
  sendUpdatedUserToServer: UpdateUserOnServerFunction;
};

/**
 * Represents the settings dialog for a user.
 */
function SettingsDialog(props: SettingsDialogProps): JSX.Element {
  const {
    setOpen,
    open,
    alert,
    sendUpdatedUserToServer,
    settings,
    updateSettings,
    appTheme,
    setTheme,
  } = props;

  /**
   * Handles closing of the SettingsDialog.
   */
  function handleClose(): void {
    setOpen(false);
  }

  /**
   * Handles saving of the user settings.
   */
  function handleSave(): void {
    setOpen(false);

    // Save their settings on the server
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
   * Sets the font size for the application as long as the provided number is
   * a positive integer. This also sets a cookie for the fontSize.
   *
   * @param {number} fontSize the new font size
   * @returns {boolean} true if successful and false if the font size value
   * wasn't correct
   */
  function setFontSize(fontSize: number): boolean {
    if (Number.isInteger(fontSize) && fontSize > 0) {
      setCookie(ClientCookies.fontSize, fontSize.toString());
      const newTheme = Object.assign(baseThemeOptions, {
        typography: { fontSize },
      });
      setTheme(createMuiTheme(newTheme));
      return true;
    }
    return false;
  }

  /**
   * Handles changing of a checkbox by making the toggling the associated
   * setting for the user.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event the event passed in by
   * the element this handler is attached to
   */
  function handleCheckboxChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    const { name, checked } = event.target;
    if (settings && updateSettings) {
      settings[name] = checked;
      updateSettings(settings);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="paper"
      aria-labelledby="settings-dialog-title"
    >
      <DialogTitle id="settings-dialog-title">Settings</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h5" component="span">
          Display
        </Typography>
        <List>
          <ListItem>
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
              <Typography variant="caption" display="block" component="span">
                Enabling this option makes it so tasks that have a pre-requisite
                are yellow and tasks that can be worked on are green. If this
                option is disabled, then tasks that have a pre-requisite are
                grayed out, and tasks that can be worked on have a normal white
                background.
              </Typography>
            </FormGroup>
          </ListItem>
          <ListItem>
            <FontSizeSetting
              fontSize={appTheme.typography.fontSize}
              setFontSize={setFontSize}
            />
          </ListItem>
        </List>
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

export default SettingsDialog;
