import { z as zod } from "zod";

const dictionaryApiJsonResponseItemMeta = zod.object({
    ants: zod.array(zod.array(zod.string())),
    id: zod.string(),
    syns: zod.array(zod.array(zod.string())),
});

const dictionaryApiJsonResponseItem = zod.object({
    fl: zod.string(),
    meta: dictionaryApiJsonResponseItemMeta,
    shortdef: zod.array(zod.string()),
});

export const dictionaryApiJsonResponse = zod.array(
    dictionaryApiJsonResponseItem
);

export type DictionaryApiJsonResponse = zod.infer<typeof dictionaryApiJsonResponse>;
export type DictionaryApiJsonResponseItemMeta = zod.infer<typeof dictionaryApiJsonResponseItemMeta>;