export const NIGERIA_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export type NigeriaState = (typeof NIGERIA_STATES)[number];
export type DeliveryFeeMap = Partial<Record<NigeriaState, number>>;

export const DEFAULT_DELIVERY_FEE = 5000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeStateName(value: string) {
  return value.trim().toLowerCase();
}

export function findNigeriaState(value: string | null | undefined) {
  const normalized = normalizeStateName(value ?? "");
  return NIGERIA_STATES.find((state) => normalizeStateName(state) === normalized) ?? null;
}

export function coerceDeliveryFee(value: unknown) {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  if (!Number.isFinite(number) || number < 0) return 0;
  return number;
}

export function getDeliveryFeesByState(settings: unknown): DeliveryFeeMap {
  const raw = isRecord(settings) && isRecord(settings.deliveryFeesByState) ? settings.deliveryFeesByState : {};
  return NIGERIA_STATES.reduce<DeliveryFeeMap>((fees, state) => {
    fees[state] = coerceDeliveryFee(raw[state]);
    return fees;
  }, {});
}

export function getDeliveryFeeForState(settings: unknown, state: string | null | undefined, fallback = DEFAULT_DELIVERY_FEE) {
  const matchedState = findNigeriaState(state);
  if (!matchedState) return coerceDeliveryFee(fallback);
  const fees = getDeliveryFeesByState(settings);
  const fee = fees[matchedState];
  return typeof fee === "number" ? fee : coerceDeliveryFee(fallback);
}
