import { UserRole } from "../../generated/prisma/client.js";

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}
