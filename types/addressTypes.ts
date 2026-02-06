export interface Address {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    street: string;
    street2?: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
    phoneNumber: string;
    isDefault: boolean;
    fullAddress?: string;
    createdDate?: string;
    updatedDate?: string;
}

export interface AddressInput {
    title: string;
    firstName: string;
    lastName: string;
    street: string;
    street2?: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
    phoneNumber: string;
    isDefault: boolean;
}
