import { PriceType } from '../enums/price-type.enum';

export interface PriceInterface {
    amount: number;
    currency: string;
    type: PriceType;
}