import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { DashboardContent } from 'src/layouts/dashboard';
import { useDevices } from 'src/hooks/use-devices';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { DeviceTableRow } from '../device-table-row';
import { DeviceTableHead } from '../device-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { DeviceTableToolbar } from '../device-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { DeviceProps } from '../types';

// ----------------------------------------------------------------------

export function DeviceView() {
  const table = useTable();
  const { devices, isLoading, error, fetchDevices } = useDevices();
  const [filterName, setFilterName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch devices when component mounts or refreshKey changes
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices, refreshKey]);

  const handleDeviceUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const dataFiltered = applyFilter({
    inputData: devices,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const notFound = (!devices?.length) || (!dataFiltered.length && !!filterName);

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Devices
        </Typography>
        <Button
          sx={{ mr: 1 }}
          variant="outlined"
          startIcon={<Iconify icon="mdi:refresh" />}
          onClick={() => fetchDevices()}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          New Device
        </Button>
      </Box>

      <Card>
        <DeviceTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <DeviceTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={devices.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    devices.map((device) => device.id)
                  )
                }
                headLabel={[
                  { id: 'display_name', label: 'Name' },
                  { id: 'u_id', label: 'ID' },
                  { id: 'org', label: 'Organization' },
                  { id: 'dept', label: 'Department' },
                  { id: 'room', label: 'Room' },
                  { id: 'line', label: 'Line' },
                  { id: 'device_type', label: 'Device Type' },
                  { id: 'firm_ver', label: 'Firmware' },
                  { id: 'status', label: 'Status' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <DeviceTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onUpdate={handleDeviceUpdate}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, devices?.length || 0)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={devices.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('display_name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
