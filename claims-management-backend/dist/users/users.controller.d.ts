import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    signup(userData: {
        name: string;
        email: string;
        password: string;
    }): Promise<{
        message: string;
    }>;
    login(loginData: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
        user: {
            id: unknown;
            name: string;
            email: string;
            role: string;
        };
    }>;
}
