import { InputType, Field } from 'type-graphql';
import { IsString, IsOptional, IsUppercase } from 'class-validator';

@InputType()
export class RoleValidator {
  @Field()
  @IsString()
  @IsUppercase()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}
