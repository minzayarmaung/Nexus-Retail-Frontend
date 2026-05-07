export interface ShopAddressRequest {
  id?: number;
  address: string;
  addressType: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateShopRequest {
  name: string;
  type: string;
  phoneNo: string;
  shopPhotoUrl: string;
  ownerId?: number;
  addresses: ShopAddressRequest[];
}

export interface UpdateShopRequest {
  name?: string;
  type?: string;
  phoneNo?: string;
  shopPhotoUrl?: string;
  ownerId?: number;
  addresses?: ShopAddressRequest[];
}

export interface ShopSummary {
  id: number;
  name: string;
  type?: string;
  phoneNo?: string;
  shopPhotoUrl?: string;
}

export interface ShopDetail extends ShopSummary {
  ownerId?: number;
  addresses?: ShopAddressRequest[];
}
