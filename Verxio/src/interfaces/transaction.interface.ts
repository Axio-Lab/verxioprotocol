export default interface ITransaction {
    _id?: string;
    buyerId: string;
    productId: string;
    price: number;
}