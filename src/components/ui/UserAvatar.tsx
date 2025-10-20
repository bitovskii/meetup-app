'use client';

interface UserAvatarProps {
  user: {
    full_name: string;
    avatar_url?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function UserAvatar({ 
  user, 
  size = 'md',
  className = '' 
}: Readonly<UserAvatarProps>) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(user.full_name);

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ${className}`}>
      {user.avatar_url ? (
        <img 
          src={user.avatar_url} 
          alt={`${user.full_name} profile picture`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide broken image and show initials fallback
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold ${sizeClasses[size].split(' ')[2]}">
                  ${initials}
                </div>
              `;
            }
          }}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold ${sizeClasses[size].split(' ')[2]}`}>
          {initials}
        </div>
      )}
    </div>
  );
}