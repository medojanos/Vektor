import * as XLSX from "xlsx";
import { fields } from "./Const";

export default function exportExcel(stops) {
    const data = stops.map((stop) =>
        Object.fromEntries(
        fields.map(({ key, label }) => [
            label,
            stop.location?.[key] ?? stop[key] ?? ""
        ])
        )
    );

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Stops");

    XLSX.writeFile(workbook, "stops.xlsx");
}