// Central brand + contact configuration for EL STYLE HOUSE.
export const site = {
  brand: "EL STYLE HOUSE",
  tagline: "Couture for the celebrated woman",
  // WhatsApp number in international format, digits only (no + or spaces).
  whatsappNumber: "2348139485908",
  whatsappMessage: "Hello EL STYLE HOUSE, I'd like to make an enquiry.",
  email: "elstylehouse@gmail.com",
  phoneDisplay: "+234 813 948 5908",
  address: "86, Ziks Avenue, Uwani, Enugu, Nigeria",
  instagram: "https://www.instagram.com/elstylehouse?igsh=dWxzNW9jOG55dnFj",
  businessHours: "Mon – Sat, 9:00am – 7:00pm",
};

export function whatsappLink(message: string = site.whatsappMessage) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
