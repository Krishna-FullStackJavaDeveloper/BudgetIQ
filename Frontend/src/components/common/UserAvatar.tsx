import React from 'react';
import Avatar from '@mui/material/Avatar';

type UserAvatarProps = {
    name: string;
  };
  
  const UserAvatar: React.FC<UserAvatarProps> = ({ name }) => {
    const getInitials = (fullName: string): string => {
      if (!fullName) return '';
      const names = fullName.trim().split(' ');
      const initials = names.map(n => n[0].toUpperCase()).join('');
      return initials.slice(0, 2); // You can adjust if you want only 1 letter
    };
  
    return (
      <Avatar sx={{ bgcolor: 'primary.main' }}>
        {getInitials(name)}
      </Avatar>
    );
  };
  
  export default UserAvatar;
