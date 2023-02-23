import { z, z as zod, ZodString } from "zod";

const expSchema = zod.array(
    zod.string()
);

const ptrsSchema = zod.array(
    zod.object({
        pointerSymbol: zod.string(),
        pos: zod.string(),
        sourceTarget: zod.string(),
        synsetOffset: zod.string(),
    })
);

const synonymSchema = zod.string();

const synonymsSchema = zod.array(
    synonymSchema
);

const resultSchema = zod.object({
    def: zod.string(),
    exp: expSchema,
    gloss: zod.string(),
    lemma: zod.string(),
    lexFilenum: zod.number(),
    lexId: zod.string(),
    lexName: zod.string(),
    pos: zod.string(),
    ptrs: ptrsSchema,
    synonyms: synonymsSchema,
    synsetOffset: zod.string(),
    wCnt: zod.number(),
});

export const wordposSchema = zod.array(
    resultSchema
);

export type Result = zod.infer<typeof resultSchema>;

export type Synonym = zod.infer<typeof synonymSchema>;