"use client";

import React, { createContext, useContext } from "react";

// We don't know the exact shape of the dictionary, so we use a loose type or `any`
// Ideally, we would infer this from the JSON files, but for now `any` or `Record<string, any>` is practical.
type Dictionary = Record<string, any>;

const DictionaryContext = createContext<Dictionary | null>(null);

export function useDictionary() {
    const dictionary = useContext(DictionaryContext);

    if (dictionary === null) {
        throw new Error("useDictionary must be used within a DictionaryProvider");
    }

    return dictionary;
}

export function DictionaryProvider({
    dictionary,
    children,
}: {
    dictionary: Dictionary;
    children: React.ReactNode;
}) {
    return (
        <DictionaryContext.Provider value={dictionary}>
            {children}
        </DictionaryContext.Provider>
    );
}
