export interface DeviceProps {
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