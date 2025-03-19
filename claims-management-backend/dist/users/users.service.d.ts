import { Model } from 'mongoose';
import { User } from './user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<User>);
    private createDefaultInsurer;
    signup(userData: {
        name: string;
        email: string;
        password: string;
    }): Promise<{
        message: string;
    }>;
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: unknown;
            name: string;
            email: string;
            role: string;
        };
    }>;
    getUserById(id: string): Promise<(import("mongoose").Document<unknown, {}, User> & User & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
}
