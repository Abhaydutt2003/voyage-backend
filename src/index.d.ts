import { ParsedQs } from "qs";

declare global {
    type  queryParamType = string | ParsedQs | (string | ParsedQs)[] | undefined
}
