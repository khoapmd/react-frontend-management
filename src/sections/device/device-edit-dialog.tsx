import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { DeviceProps } from './types';

interface DeviceEditDialogProps {
  open: boolean;
  device: DeviceProps | null;
  onClose: () => void;
  onSubmit: (device: DeviceProps) => Promise<void>;
}

export function DeviceEditDialog({ open, device, onClose, onSubmit }: DeviceEditDialogProps) {
  const [formData, setFormData] = useState<Partial<DeviceProps>>({});

  useEffect(() => {
    if (device) {
      setFormData(device);
    }
  }, [device]);

  const handleChange = (field: keyof DeviceProps) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    if (formData && device) {
      await onSubmit({ ...device, ...formData });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Device {device?.display_name} ({device?.source})
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Organization"
              value={formData.org || ''}
              onChange={handleChange('org')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Department"
              value={formData.dept || ''}
              onChange={handleChange('dept')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Room"
              value={formData.room || ''}
              onChange={handleChange('room')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Line"
              value={formData.line || ''}
              onChange={handleChange('line')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Display Name"
              value={formData.display_name || ''}
              onChange={handleChange('display_name')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Device ID"
              value={formData.u_id || ''}
              onChange={handleChange('u_id')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Device Type"
              value={formData.device_type || ''}
              onChange={handleChange('device_type')}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Firmware Version"
              value={formData.firm_ver || ''}
              onChange={handleChange('firm_ver')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
} 