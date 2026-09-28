import * as XLSX from "xlsx";
import { Stop } from "./Objects.js";

export default function importExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, {
          type: "array"
        });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: ""
        });

        const stops = rows
          .slice(2)
          .filter(row => row.some(value => value !== ""))
          .filter(row => row[11] !== "0")
          .map(row => {
            return new Stop({
              id: row[0],
              name: row[3],
              email: row[4],
              phone: row[5],

              price: row[8],
              deliveryPrice: row[11],

              postalCode: row[19],
              city: row[20],
              address: row[21],
              addressOther: row[22],

              note: row[27],
              parcel: row[30]
            });
          });
        resolve(stops);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read Excel file."));
    };

    reader.readAsArrayBuffer(file);
  });
}