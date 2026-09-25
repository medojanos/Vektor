import * as XLSX from "xlsx";
import { Stop } from "./classes";

/*
name           -> 3
email          -> 4
phone          -> 5
price          -> 8
delivery_price -> 11
post_number    -> 19
city           -> 20
address        -> 21
address_other  -> 22
note           -> 27
package        -> 30
id             -> 0
*/

export async function importStopsFromExcel(file) {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  // Use the first worksheet
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  // Convert Excel sheet to arrays.
  // header: 1 means each row is returned as an array.
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  const stops = rows
    .slice(1) // Skip header row
    .map((row) => {
      const stop = new Stop();

      stop.name = row[3] || "";
      stop.email = row[4] || "";
      stop.phone = row[5] || "";

      stop.price = toNumber(row[8]);
      stop.deliveryPrice = toNumber(row[11]);

      stop.postalCode = row[19] || "";
      stop.city = row[20] || "";
      stop.address = row[21] || "";
      stop.addressOther = row[22] || "";

      stop.note = row[27] || "";
      stop.parcel = row[30] || "";

      // Build full address
      stop.fullAddress = [
        stop.postalCode,
        stop.city,
        stop.address,
        stop.addressOther,
      ]
        .filter(Boolean)
        .join(", ");

      return stop;
    })
    .filter((stop) => {
      // Ignore completely empty rows
      return (
        stop.name ||
        stop.phone ||
        stop.address ||
        stop.city ||
        stop.parcel
      );
    });

  return stops;
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  // Handles values such as "12,50"
  const normalized = String(value).replace(",", ".");

  const number = Number(normalized);

  return Number.isNaN(number) ? 0 : number;
}