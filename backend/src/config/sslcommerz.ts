import axios from "axios";

const STORE_ID = process.env.SSLCOMMERZ_STORE_ID as string;
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD as string;
const IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE === "true";

const BASE_URL = IS_LIVE
  ? "https://securepay.sslcommerz.com"
  : "https://sandbox.sslcommerz.com";

export interface InitPaymentParams {
  amount: number;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl?: string;
}

/**
 * Initiates a payment session with SSLCommerz and returns the gateway
 * redirect URL (GatewayPageURL) that the client should be sent to.
 */
export async function initiateSslCommerzPayment(params: InitPaymentParams) {
  const payload = {
    store_id: STORE_ID,
    store_passwd: STORE_PASSWORD,
    total_amount: params.amount,
    currency: "BDT",
    tran_id: params.transactionId,
    success_url: params.successUrl,
    fail_url: params.failUrl,
    cancel_url: params.cancelUrl,
    ipn_url: params.ipnUrl,
    cus_name: params.customerName,
    cus_email: params.customerEmail,
    cus_phone: params.customerPhone || "N/A",
    cus_add1: "N/A",
    cus_city: "N/A",
    cus_country: "Bangladesh",
    shipping_method: "NO",
    product_name: "Rent/Deposit/Utility Payment",
    product_category: "Housing",
    product_profile: "general",
  };

  const { data } = await axios.post(
    `${BASE_URL}/gwprocess/v4/api.php`,
    new URLSearchParams(payload as never).toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  if (data.status !== "SUCCESS") {
    throw new Error(data.failedreason || "Failed to initiate SSLCommerz payment session");
  }

  return { gatewayUrl: data.GatewayPageURL as string, sessionKey: data.sessionkey as string };
}

/**
 * Validates a transaction with SSLCommerz's validation API — always call this
 * server-side on the success callback/IPN before marking a payment as SUCCESS,
 * never trust the client-side redirect alone.
 */
export async function validateSslCommerzTransaction(valId: string) {
  const { data } = await axios.get(
    `${BASE_URL}/validator/api/validationserverAPI.php`,
    { params: { val_id: valId, store_id: STORE_ID, store_passwd: STORE_PASSWORD, format: "json" } }
  );
  return data;
}
