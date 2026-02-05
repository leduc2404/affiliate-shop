export interface Product {
  // Main fields (from JSON files)
  phan_loai: string;
  title: string;
  image: string;
  product_id: string;
  rating: number;
  link: string;
  price_low: string;
  price_high: string;
  sold: string;
  
  // Optional legacy fields (for sanpham page compatibility)
  id?: string;
  name?: string;
  image_url?: string;
  affiliate_link?: string;
  category?: string;
  price?: number;
  old_price?: number;
  discount_code?: string;
  is_hot?: boolean;
  created_at?: string;
  createdAt?: string;
}


export interface ShopInfo {
  name: string;
  avatar: string;
  bio: string;
  socialLinks: {
    tiktok?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    shopee?: string;
  };
}
