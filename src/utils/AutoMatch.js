const SYNONYMS = {
    id: ["id"],
    name: ["name", "neve", "név"],
    email: ["email"],
    phone: ["phone", "telefonszám"],
    price: ["price", "összeg"],
    deliveryPrice: ["delivery price", "szállítási költség"],
    postalCode: ["postal code", "szállítási irányítószám"],
    city: ["city", "szállítási település"],
    address: ["address", "szállítási cím"],
    addressOther: ["address other", "szállítási cím egyéb"],
    note: ["note", "megjegyzés"],
    parcel: ["parcel", "tételek"]
};

export default function autoMatchHeaders(headers = [], fields = []) {
    const result = {};

    fields.forEach(field => {
        const targets = [field.label, field.key, ...(SYNONYMS[field.key] || [])]
            .map(s => s.toLowerCase());

        const match = headers.find(col => targets.some(t => String(col.header).toLowerCase().trim() === t))
            || headers.find(col => targets.some(t => String(col.header).toLowerCase().includes(t)));

        if (match) {
            result[field.key] = match.number;
        }
    });

    return result;
}
