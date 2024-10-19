import { IsString, IsEmail, Length, Matches } from 'class-validator'

export class signInDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @Length(5, 64, { message: 'Email must be between 5 and 64 characters' })
    public email?: string

    @IsString({ message: 'Password must be a string' })
    @Length(8, 32, { message: 'Password must be between 8 and 32 characters' })
    public password?: string
}

export class signUpDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @Length(5, 64, { message: 'Email must be between 5 and 64 characters' })
    public email?: string

    @IsString({ message: 'Password must be a string' })
    @Length(8, 32, { message: 'Password must be between 8 and 32 characters' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
    )
    public password?: string
}