import * as XLSX from "xlsx";
import { Stop } from "./Objects.js";
import getCoordinates from "./Coordinates.js"

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function importExcel({file, overrideStops, columnHeader, headersOnly = false, headerRow = 0}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const workbook = XLSX.read(event.target.result, {
          type: "array"
        });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: ""
        });

        if (headersOnly) {
          const headers = rows[headerRow-1 < 0 ? 0 : headerRow-1].map((column, index) => ({
            header: column,
            number: index
          }));

          return resolve(headers);
        }

        const seenOrders = new Set(
          overrideStops?.map(stop => stop.id) ?? []
        );

        const validRows = rows
          .slice(headerRow)
          .filter(row => row.some(cell => cell !== ""))
          .filter(row => row[columnHeader?.deliveryPrice] !== "0")
          .filter(row => !seenOrders.has(row[columnHeader.id]))
          .map(row => {
            row[columnHeader.city] = row[columnHeader.city].replace("ker.", "kerület");
            return row;
          })

        const stops = [];

        for (const row of validRows) {
          const coordinates = await getCoordinates(`${row[columnHeader.postalCode] || ""} ${row[columnHeader.city] || ""}, ${row[columnHeader.address] || ""}`);
          stops.push(
            new Stop(
              {
                id: row[columnHeader.id],
                name: row[columnHeader.name],
                email: row[columnHeader.email],
                phone: row[columnHeader.phone],

                price: row[columnHeader.price],
                deliveryPrice: row[columnHeader.deliveryPrice],

                postalCode: row[columnHeader.postalCode],
                city: row[columnHeader.city],
                address: row[columnHeader.address],
                addressOther: row[columnHeader.addressOther],
                fullAddress: `${row[columnHeader.postalCode]} ${row[columnHeader.city]}, ${row[columnHeader.address]} ${row[columnHeader.addressOther]}`,
                
                note: row[columnHeader.note],
                parcel: row[columnHeader.parcel],

                coordinates: coordinates,

                active: Boolean(coordinates),
              }
            ));
          await sleep(1000);
        }
        resolve(stops);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read Excel file"));
    };

    reader.readAsArrayBuffer(file);
  });
}