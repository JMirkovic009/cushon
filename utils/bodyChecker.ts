import { z } from "zod";

//define the paramater types
export const apiBodySchema = z.object({
  accountId: z.number(),
  contribution: z.object({
    amount: z.number(),
    fixed: z.boolean(),
  }),
});
