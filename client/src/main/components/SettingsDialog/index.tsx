import React, { useState } from 'react';
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
import { AlertFunction } from '../../App';
import FontSizeSetting from './FontSizeSetting';
import baseThemeOptions from '../../AppTheme';
import { setCookie, ClientCookies } from '../../utils/clientCookies';
import UserData from '../../clientData/UserData';
import TagsSetting from './TagsSetting';

type SettingsDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  alert: AlertFunction;
  appTheme: Theme;
  setTheme: (updatedTheme: Theme) => void;
};

/**
 * Represents the settings dialog for a user.
 */
function SettingsDialog(props: SettingsDialogProps): JSX.Element {
  const { setOpen, open, alert, appTheme, setTheme } = props;

  const [pendingClientSettings, setPendingClientSettings] = useState<{
    fontSize: number;
  }>({ fontSize: appTheme.typography.fontSize });

  const [userSettings, setUserSettings] = useState({
    ...UserData.getUser().settings,
  });

  /**
   * Handles closing of the SettingsDialog.
   */
  function handleClose(): void {
    setOpen(false);
  }

  function saveClientSettings(): void {
    const { fontSize } = pendingClientSettings;
    setCookie(ClientCookies.fontSize, fontSize.toString());
    const newTheme = Object.assign(baseThemeOptions, {
      typography: { fontSize },
    });
    setTheme(createMuiTheme(newTheme));
  }

  /**
   * Handles saving of the user settings.
   */
  function handleSave(): void {
    setOpen(false);

    saveClientSettings();

    // Save their settings on the server
    UserData.setAndSaveUserProperty('settings', userSettings);
    alert('success', 'Successfully saved settings!');
  }

  /**
   * Sets the font size for the application. The input value is expected to
   * be a positive integer and already validated.
   *
   * @param {number} fontSize the new font size
   */
  function setFontSize(fontSize: number): void {
    pendingClientSettings.fontSize = fontSize;
    setPendingClientSettings(pendingClientSettings);
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
    const newUserSettings = { ...userSettings };
    newUserSettings[name] = checked;
    setUserSettings(newUserSettings);
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
                    checked={userSettings.yellowGreenTasks}
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
            <FormGroup row={false}>
              <FormControlLabel
                label="Notes Expanded by Default"
                control={
                  <Checkbox
                    checked={userSettings.notesExpanded}
                    color="primary"
                    name="notesExpanded"
                    onChange={handleCheckboxChange}
                  />
                }
              />
              <Typography variant="caption" display="block" component="span">
                Enabling this keeps notes expanded when you open the
                application.
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
        <Typography variant="h5" component="span">
          User
        </Typography>
        <List>
          <ListItem>
            <TagsSetting />
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
