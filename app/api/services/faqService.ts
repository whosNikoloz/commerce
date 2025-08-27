import { FAQModel } from "@/types/faq";
import { apiFetch } from "../client/fetcher";

const API_BASE = "http://localhost:5007/FAQ";

export async function getAllFaqs(): Promise<FAQModel[]> {
    return apiFetch<FAQModel[]>(`${API_BASE}/get-all-faqs`);
}

export async function getFaqById(id: string): Promise<FAQModel> {
    return apiFetch<FAQModel>(`${API_BASE}/get-faq-by-${id}`);
}

export async function createFaq(
    question: string,
    answer: string,
    isActive: boolean,
    isFeatured: boolean,
    orderNum?: 0
): Promise<string> {
    const data = { question, answer, isActive, isFeatured, orderNum };
    return apiFetch<string>(`${API_BASE}/add-faq`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateFaq(data: FAQModel): Promise<string> {
    return apiFetch<string>(`${API_BASE}/update-faq`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteFaq(id: string): Promise<string> {
    return apiFetch<string>(`${API_BASE}/delete-faq-by-${id}`, {
        method: "DELETE",
    });
}


