import { InputType, Field } from 'type-graphql';
import {
  IsString,
  IsEmail,
  IsDate,
  IsOptional,
  MinLength,
} from 'class-validator';

@InputType()
class UserValidator {
  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(5)
  password: string;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  notes?: string;
}

export default UserValidator;
