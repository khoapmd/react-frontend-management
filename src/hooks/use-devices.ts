import { useState, useCallback } from 'react';
import { apiClient } from 'src/utils/api-client';
import { useAuth } from './use-auth';

interface Device {
  id: string;
  org: string;
  dept: string;
  room: string;
  line: string;
  display_name: string;
  u_id: string;
  device_type: string;
  firm_ver: string;
  isVerified: boolean;
  avatarUrl: string;
  status: string;
  source: 'tempHumi' | 'chamber';
}

interface DeviceEditPayload {
  id: string;
  org: string;
  dept: string;
  room: string;
  line: string;
  display_name: string;
  u_id: string;
  device_type: string;
  firm_ver: string;
  source: 'tempHumi' | 'chamber';
}

const ENDPOINTS = {
  tempHumi: {
    base: '/v1/temphumi/data',
    all: '/v1/temphumi/data/all'
  },
  chamber: {
    base: '/v1/chamber/data',
    all: '/v1/chamber/data/all'
  }
};

export function useDevices() {
  const { getToken } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('No authentication token found');
      return;
    }

    setIsLoading(true);
    try {
      const endpointList = [ENDPOINTS.tempHumi.all, ENDPOINTS.chamber.all];
      
      const responses = await Promise.all(
        endpointList.map(endpoint => 
          apiClient.fetch(endpoint, {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'auth_token': token
            }
          })
        )
      );

      const allDevices = responses.flatMap((deviceList, index) => 
        deviceList.map((device: any) => ({
          ...device,
          isVerified: true,
          avatarUrl: '',
          status: 'active',
          source: index === 0 ? 'tempHumi' : 'chamber'
        }))
      );

      setDevices(allDevices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  const editDevice = useCallback(async (device: DeviceEditPayload) => {
    const token = getToken();
    if (!token) {
      setError('No authentication token found');
      return false;
    }

    const baseEndpoint = device.source === 'chamber' 
      ? ENDPOINTS.chamber.base 
      : ENDPOINTS.tempHumi.base;

    try {
      await apiClient.fetch(baseEndpoint, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'auth_token': token
        },
        body: JSON.stringify({
          org: device.org,
          dept: device.dept,
          room: device.room,
          line: device.line,
          display_name: device.display_name,
          u_id: device.u_id,
          device_type: device.device_type,
          firm_ver: device.firm_ver
        })
      });

      setDevices(prevDevices => 
        prevDevices.map(d => {
          if (d.u_id === device.u_id) {
            return {
              ...d,
              ...device,
              isVerified: d.isVerified,
              avatarUrl: d.avatarUrl,
              status: d.status,
              source: d.source
            };
          }
          return d;
        })
      );

      return true;
    } catch (err) {
      console.error('Edit device error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update device');
      return false;
    }
  }, [getToken]);

  const deleteDevice = useCallback(async (device: Device) => {
    const token = getToken();
    if (!token) {
      setError('No authentication token found');
      return false;
    }

    const baseEndpoint = device.source === 'chamber'
      ? ENDPOINTS.chamber.base 
      : ENDPOINTS.tempHumi.base;

    try {
      await apiClient.fetch(`${baseEndpoint}?u_id=${device.u_id}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'auth_token': token
        }
      });

      setDevices(prevDevices => 
        prevDevices.filter(d => d.u_id !== device.u_id)
      );

      return true;
    } catch (err) {
      console.error('Delete device error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete device');
      return false;
    }
  }, [getToken]);

  return {
    devices,
    isLoading,
    error,
    fetchDevices,
    editDevice,
    deleteDevice,
  };
} 