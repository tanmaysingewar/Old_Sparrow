/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as chats from "../chats.js";
import type * as coupon from "../coupon.js";
import type * as generate from "../generate.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as pdfActions from "../pdfActions.js";
import type * as prompts from "../prompts.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  chats: typeof chats;
  coupon: typeof coupon;
  generate: typeof generate;
  http: typeof http;
  messages: typeof messages;
  pdfActions: typeof pdfActions;
  prompts: typeof prompts;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
