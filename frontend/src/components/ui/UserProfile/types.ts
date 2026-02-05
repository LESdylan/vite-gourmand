/**
 * UserProfile Types
 * Types for user profile display and visibility
 */

export interface UserProfileData {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'superadmin' | 'admin' | 'employee' | 'customer';
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  joinedAt?: string;
  lastActive?: string;
  stats?: UserStats;
}

export interface UserStats {
  ordersHandled?: number;
  ordersCompleted?: number;
  averageRating?: number;
  totalRevenue?: number;
  shiftsWorked?: number;
  hoursWorked?: number;
}

export interface UserProfileProps {
  userId: string;
  onClose?: () => void;
  isModal?: boolean;
}
