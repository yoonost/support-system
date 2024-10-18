import { IsString, IsNumber, Length, Min } from 'class-validator'

export class messagesDto {
    @IsNumber({}, { message: 'Ticket ID must be a valid number' })
    @Min(1, { message: 'Ticket ID must be a positive number' })
    public ticketId?: number
}

export class newTicketDto {
    @IsString({ message: 'Subject must be a string' })
    @Length(5, 100, { message: 'Subject must be between 5 and 100 characters long' })
    public subject?: string

    @IsString({ message: 'Message must be a string' })
    @Length(1, 500, { message: 'Message must be between 1 and 500 characters long' })
    public message?: string
}

export class addMessageDto {
    @IsNumber({}, { message: 'Ticket ID must be a valid number' })
    @Min(1, { message: 'Ticket ID must be a positive number' })
    public ticketId?: number

    @IsString({ message: 'Message must be a string' })
    @Length(1, 500, { message: 'Message must be between 1 and 500 characters long' })
    public message?: string
}