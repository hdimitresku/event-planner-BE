export interface VenueAddressInterface {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    location?: {
        latitude: number;
        longitude: number;
    };
}