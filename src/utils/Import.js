import * as XLSX from "xlsx";
import { Stop } from "./Objects.js";
import getCoordinates from "./Coordinates.js"

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function importExcel(file, overrideStops) {
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

        const seenIds = new Set(
          overrideStops?.map(stop => stop.id ?? [])
        );

        const validRows = rows
          .slice(2)
          .filter(row => row.some(value => value !== ""))
          .filter(row => row[11] !== "0")
          .filter(row => !seenIds.has(row[0]))

        const stops = [];

        for (const row of validRows) {
          const fullAddress = `${row[19]} ${row[20]}, ${row[21]} ${row[22]}`;
          const coordinates = await getCoordinates(fullAddress);
          stops.push(
            new Stop(
              {
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
                fullAddress: fullAddress,

                coordinates: coordinates,

                note: row[27],
                parcel: row[30],
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
      reject(new Error("Failed to read Excel file."));
    };

    reader.readAsArrayBuffer(file);
  });
}