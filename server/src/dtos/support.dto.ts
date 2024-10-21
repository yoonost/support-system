import { IsString, IsNumber, Length, Min } from 'class-validator'

export class newTicketDto {
    @IsString({ message: 'Subject must be a string' })
    @Length(5, 100, { message: 'Subject must be between 5 and 100 characters long' })
    public subject?: string

    @IsString({ message: 'Message must be a string' })
    @Length(1, 500, { message: 'Message must be between 1 and 500 characters long' })
    public message?: string
}

export class addMessageDto {
    @IsString({ message: 'Message must be a string' })
    @Length(1, 500, { message: 'Message must be between 1 and 500 characters long' })
    public message?: string
}