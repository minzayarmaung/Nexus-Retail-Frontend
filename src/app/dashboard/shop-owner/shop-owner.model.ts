export interface CreateShopOwnerRequest {
  username: string;
  email: string;
  password: string;
  phoneNo: string;
  shopId: number;
  firstName?: string;
  lastName?: string;
}

