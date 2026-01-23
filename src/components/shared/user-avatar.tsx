
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "next-auth";

interface UserAvatarProps {
  user: Partial<User>;
  className?: string;
}

export const UserAvatar = ({ user, className }: UserAvatarProps) => {
  const getInitials = (name?: string | null) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <Avatar className={className}>
      <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
      <AvatarFallback>
        {getInitials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
};
