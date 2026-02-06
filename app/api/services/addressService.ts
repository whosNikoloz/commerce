import { apiFetch } from "../client/fetcher";
import { Address, AddressInput } from "@/types/addressTypes";

const ADDRESS_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "Address/";

export async function getUserAddresses(userId: string): Promise<Address[]> {
    const res = await apiFetch<Address[]>(`${ADDRESS_BASE}get-user-addresses?userId=${userId}`, {
        method: "GET",
    });
    return res;
}

export async function getAddressById(id: string, userId: string): Promise<Address> {
    const res = await apiFetch<Address>(`${ADDRESS_BASE}get-address-by-${id}?userId=${userId}`, {
        method: "GET",
    });
    return res;
}

export async function getDefaultAddress(userId: string): Promise<Address> {
    const res = await apiFetch<Address>(`${ADDRESS_BASE}get-default-address?userId=${userId}`, {
        method: "GET",
    });
    return res;
}

export async function addAddress(userId: string, address: AddressInput): Promise<Address> {
    const res = await apiFetch<Address>(`${ADDRESS_BASE}add-address?userId=${userId}`, {
        method: "POST",
        body: JSON.stringify(address),
    });
    return res;
}

export async function updateAddress(userId: string, address: Address): Promise<Address> {
    const res = await apiFetch<Address>(`${ADDRESS_BASE}update-address?userId=${userId}`, {
        method: "PUT",
        body: JSON.stringify(address),
    });
    return res;
}

export async function deleteAddress(id: string, userId: string): Promise<void> {
    await apiFetch(`${ADDRESS_BASE}delete-address-${id}?userId=${userId}`, {
        method: "DELETE",
    });
}

export async function setDefaultAddress(id: string, userId: string): Promise<void> {
    await apiFetch(`${ADDRESS_BASE}set-default-address-${id}?userId=${userId}`, {
        method: "PUT",
    });
}
