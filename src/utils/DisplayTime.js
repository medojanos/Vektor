export default function DisplayTime(time) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    return `${hours > 0 ? `${hours} h ` : ""}${minutes} min`;
}