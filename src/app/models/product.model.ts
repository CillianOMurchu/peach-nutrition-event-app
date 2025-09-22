export interface ProductModel {
  name: string;
  brand: string;
  wholesalePrice: number;
  resalePrice: number;
  price: number;
  image: string;
  quantity: number;
  description: string;
}

export const BrandLogos = {
  BAREBELLS:
    'https://cdn.shopify.com/s/files/1/0940/3557/5114/files/Barebells_iduJMc3K3w_1.svg?v=1757636842',
  WEIDER:
    'https://cdn.shopify.com/s/files/1/0940/3557/5114/files/weider.svg?v=1757637027',
  DION: 'https://cdn.shopify.com/s/files/1/0940/3557/5114/files/dion.svg?v=1757638356',
  IOGENIX:
    'https://cdn.shopify.com/s/files/1/0940/3557/5114/files/iogenix.svg?v=1757637340',
  NOCCO:
    'https://cdn.shopify.com/s/files/1/0940/3557/5114/files/NOCCO_idt5IyMNTk_1.svg?v=1757637404',
};
