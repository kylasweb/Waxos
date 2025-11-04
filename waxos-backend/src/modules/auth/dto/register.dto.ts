import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Invalid email format' })
    email!: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(100, { message: 'Password must not exceed 100 characters' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
            message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
        },
    )
    password!: string;

    @IsString()
    @MinLength(2, { message: 'Full name must be at least 2 characters' })
    @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
    fullName!: string;

    @IsString()
    @MinLength(3, { message: 'Workspace name must be at least 3 characters' })
    @MaxLength(255, { message: 'Workspace name must not exceed 255 characters' })
    workspaceName!: string;
}
