import * as XLSX from "xlsx";
import { fields } from "./Const";

function fileName(stops) {
    const format = city => (city.toLowerCase().replace(" ", ""));
    const activeStops = stops.filter(stop => stop.active);
    const start = stops[0]?.location.city;
    const end = activeStops[activeStops.length-1]?.location.city;
    if (start && end) return `${format(start)}-${format(end)}`;
    return "route"
}

export default function exportExcel(stops) {
    const data = stops.map((stop) =>
        Object.fromEntries(
            fields.map(({ key, label }) => [
                label,
                String(stop[key] ?? stop.location?.[key])
            ])
        )
    );

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Stops");

    XLSX.writeFile(workbook, `${fileName(stops)}.xlsx`);
}