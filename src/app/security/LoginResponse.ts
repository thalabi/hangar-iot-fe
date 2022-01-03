import { CustomUserDetails } from "../login/CustomUserDetails";

export interface LoginResponse {
    customUserDetails: CustomUserDetails
    token: string
}