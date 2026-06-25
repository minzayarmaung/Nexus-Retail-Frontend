export interface PasswordValidationPolicyData {
  id: number;
  regex: string;
  description: string;
  key: string;
  active: boolean;
}

export interface PasswordValidationPolicyDto {
  id: number;
  regex: string;
  description: string;
  key: string;
  active: boolean;
}

export function mapPasswordValidationPolicyDto(
  dto: PasswordValidationPolicyDto,
): PasswordValidationPolicyData {
  return {
    id: dto.id,
    regex: dto.regex,
    description: dto.description,
    key: dto.key,
    active: dto.active,
  };
}
