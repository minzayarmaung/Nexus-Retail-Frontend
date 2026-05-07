export interface CreateShopOwnerRequest {
  username: string;
  name: string;
  profileUrl: string;
  email: string;
  password: string;
  phoneNo: string;
  shopId: number;
}

export interface ShopOption {
  id: number;
  name: string;
}

