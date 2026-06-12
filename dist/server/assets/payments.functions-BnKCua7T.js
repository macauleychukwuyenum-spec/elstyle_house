import * as React from "react";
import { useRouter, isRedirect } from "@tanstack/react-router";
import { T as TSS_SERVER_FUNCTION, b as getServerFnById, a as createServerFn } from "./server-CQySRrHc.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-evZWmw3m.js";
function useServerFn(serverFn) {
  const router = useRouter();
  return React.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().min(6).max(30),
  address_line: z.string().trim().min(3).max(300),
  city: z.string().trim().max(120).optional().default(""),
  state: z.string().trim().max(120).optional().default("")
});
const initiateFlutterwavePayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(checkoutSchema).handler(createSsrRpc("b6cd6f639b0395ed6343660394aa0c5a941b7c8557ba00c028aad95c3fb2ddc3"));
const verifyFlutterwavePayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator(z.object({
  transaction_id: z.string().trim().min(1).max(64),
  tx_ref: z.string().trim().min(1).max(120)
})).handler(createSsrRpc("74404dd995358838a5931235b65a01a36b76503fa957a39208125146b6b8e585"));
export {
  initiateFlutterwavePayment as i,
  useServerFn as u,
  verifyFlutterwavePayment as v
};
