export interface Address {
  firstName?: string;
  lastName?: string;
  phone?: string;
  street?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  latitude?: number;
  longitude?: number;
  isLiveLocation?: boolean;
}

export interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
}

export interface Order {
  _id: string;
  userId?: string;
  items: OrderItem[];
  amount: number;
  address?: Address;
  status: string;
  paymentMethod: string;
  payment?: boolean;
  date: number | string;
  orderType?: "single" | "multi";
  adminCommission?: number;
  shopPayout?: number;
  deliveryBoyPayout?: number;
  shopName?: string;
  shopId?: string;
  deliveryBoyId?: string;
  deliveryBoyName?: string;
  deliveryBoyPhone?: string;
  deliveryStatus?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  sizes?: string[];
  bestseller?: boolean;
  date?: number;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
}

export interface BannerSlot {
  id?: string;
  badge: string;
  title: string;
  discount: string;
  offText?: string;
  btnText: string;
  categoryFilter?: string;
  bgColor?: string;
  accentColor?: string;
  imageUrl: string;
}

export interface Shop {
  _id: string;
  name: string;
  ownerName?: string;
  phone: string;
  category?: string;
  gstNumber?: string;
  aadhaarNumber?: string;
  address?: {
    street?: string;
    city?: string;
    pinCode?: string;
  };
  status: "Pending" | "Approved" | "Rejected";
}

export interface DeliveryPartner {
  _id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber?: string;
  aadhaarNumber?: string;
  drivingLicenseNumber?: string;
  isOnline?: boolean;
  walletBalance?: number;
  status: "Pending" | "Approved" | "Rejected";
}

export interface ReturnRequest {
  _id: string;
  orderId: string;
  userId?: string;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt?: string;
}

export interface FinanceSummary {
  totalGrossVolume?: number;
  totalOrders?: number;
  totalAdminCommission?: number;
  totalShopPayouts?: number;
  totalDeliveryPayouts?: number;
}
