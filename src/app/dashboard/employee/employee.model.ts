export interface EmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  dateOfBirth?: string;
  address?: string;
  position?: string;
  hireDate?: string;
  salary?: string;
  createUserAccount?: boolean;
  userRole?: string;
  username?: string;
  password?: string;
}

export interface EmployeeDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  dateOfBirth?: string | null;
  address?: string | null;
  position?: string | null;
  hireDate?: string | null;
  salary?: string | null;
  shopId?: number | null;
}

