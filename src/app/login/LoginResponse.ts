import { CustomUserDetails } from "./CustomUserDetails";

export interface LoginResponse {
    customUserDetails: CustomUserDetails
    token: string
}