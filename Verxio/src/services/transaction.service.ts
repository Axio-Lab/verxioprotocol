import ITransaction from "../interfaces/transaction.interface";
import Transaction from "../models/transaction.model";

export default class TransactionService {
    async create(transaction: Partial<ITransaction>) {
        return await Transaction.create(transaction);
    }
}