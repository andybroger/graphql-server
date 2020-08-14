import { InputType, Field } from 'type-graphql';
import { IsString, IsEmail, IsDate, IsOptional, MinLength } from 'class-validator';

@InputType()
class UserValidator {
  @Field()
  @IsString()
  public firstName: string;

  @Field()
  @IsString()
  public lastName: string;

  @Field()
  @IsEmail()
  public email: string;

  @Field()
  @IsString()
  @MinLength(5)
  public password: string;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  public born?: Date;
}

export default UserValidator;
