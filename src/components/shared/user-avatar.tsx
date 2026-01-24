
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";
import { User } from "next-auth";

interface UserAvatarProps {
  user: Partial<User>;
  className?: string;
}

export const UserAvatar = ({ user, className }: UserAvatarProps) => {
  return (
    <Avatar className={className}>
      <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
      <AvatarFallback className="bg-gray-700">
        <UserIcon className="text-gray-400" />
      </AvatarFallback>
    </Avatar>
  );
};
