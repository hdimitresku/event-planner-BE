import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from '@/user/dto/user.dto';

export const GetUser = createParamDecorator(
    (data: keyof UserDto | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const jwtPayload = request.user; // Raw JWT payload { sub, email, role, iat, exp }

        if (!jwtPayload) {
            return null; // Or throw an UnauthorizedException if user is required
        }

        // Map JWT payload to UserDto
        const userDto: Partial<UserDto> = {
            id: jwtPayload.userId, // Map 'sub' to 'id'
            email: jwtPayload.email,
            role: jwtPayload.role
        };

        // Return specific field if requested (e.g., @GetUser('id'))
        return data ? userDto[data] : userDto;
    },
);