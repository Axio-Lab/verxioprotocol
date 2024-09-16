export default interface IProduct {
    _id?: string;
    userId: string;
    name: string;
    image: string;
    description: string;
    type: string;
    category: string;
    payAnyPrice?: boolean;
    unlimited: boolean;
    price?: number;
    quantity: number;
    productFile: string;
    sales: number;
    revenue: number;
}