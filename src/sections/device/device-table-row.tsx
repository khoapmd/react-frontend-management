import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useDevices } from 'src/hooks/use-devices';
import { DeviceEditDialog } from './device-edit-dialog';
import { DeviceProps } from './types';

// ----------------------------------------------------------------------

type DeviceTableRowProps = {
  row: DeviceProps;
  selected: boolean;
  onSelectRow: () => void;
  onUpdate: () => void;
};

export function DeviceTableRow({ row, selected, onSelectRow, onUpdate }: DeviceTableRowProps) {
  const { editDevice, deleteDevice } = useDevices();
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleEdit = useCallback(() => {
    setOpenEditDialog(true);
    handleClosePopover();
  }, [handleClosePopover]);

  const handleEditSubmit = useCallback(async (updatedDevice: DeviceProps) => {
    const success = await editDevice(updatedDevice);
    if (success) {
      onUpdate();
      setOpenEditDialog(false);
    }
  }, [editDevice, onUpdate]);

  const handleDelete = useCallback(async () => {
    const success = await deleteDevice(row);
    if (success) {
      onUpdate();
      handleClosePopover();
    }
  }, [deleteDevice, row, handleClosePopover, onUpdate]);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
            <Avatar alt={row.display_name} src={row.avatarUrl} />
            {row.display_name}
          </Box>
        </TableCell>

        <TableCell>{row.u_id}</TableCell>
        <TableCell>{row.org}</TableCell>
        <TableCell>{row.dept}</TableCell>
        <TableCell>{row.room}</TableCell>
        <TableCell>{row.line}</TableCell>
        <TableCell>{row.device_type}</TableCell>
        <TableCell>{row.firm_ver}</TableCell>
        <TableCell>
          <Label color={(row.status === 'offline' && 'error') || 'success'}>{row.status}</Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>

      <DeviceEditDialog
        open={openEditDialog}
        device={row}
        onClose={() => setOpenEditDialog(false)}
        onSubmit={handleEditSubmit}
      />
    </>
  );
}
