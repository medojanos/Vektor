const DATABASE_NAME = "vektor";
const DATABASE_VERSION = 1;
const ROUTES_STORE = "routes";
const SETTINGS_STORE = "settings";

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

        request.onupgradeneeded = () => {
            const database = request.result;
            database.createObjectStore(ROUTES_STORE, {keyPath: "createdAt"});
            database.createObjectStore(SETTINGS_STORE, {keyPath: "key"});
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error("Route storage upgrade is blocked."));
    });
}

function transactionComplete(transaction) {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error || new Error("Route storage transaction was aborted."));
    });
}

function requestResult(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function migrateLegacyData(database) {
    const savedRoutes = localStorage.getItem("routes");
    const savedSelection = localStorage.getItem("selected");

    if (savedRoutes === null && savedSelection === null) return;

    const routes = savedRoutes === null ? [] : JSON.parse(savedRoutes);
    const selected = savedSelection === null ? null : JSON.parse(savedSelection);

    if (!Array.isArray(routes)) {
        throw new Error("Saved routes in local storage are not a valid route list.");
    }

    const transaction = database.transaction([ROUTES_STORE, SETTINGS_STORE], "readwrite");
    const completed = transactionComplete(transaction);
    const routeStore = transaction.objectStore(ROUTES_STORE);

    routes.forEach(route => routeStore.put(route));
    if (selected) {
        transaction.objectStore(SETTINGS_STORE).put({key: "selected", route: selected});
    }

    await completed;
    localStorage.removeItem("routes");
    localStorage.removeItem("selected");
}

async function getReadyDatabase() {
    const database = await openDatabase();
    await migrateLegacyData(database);
    return database;
}

export async function getRoutes() {
    const database = await getReadyDatabase();
    const transaction = database.transaction(ROUTES_STORE, "readonly");
    const completed = transactionComplete(transaction);
    const routes = await requestResult(transaction.objectStore(ROUTES_STORE).getAll());
    await completed;
    return routes;
}

export async function getSelectedRoute() {
    const database = await getReadyDatabase();
    const transaction = database.transaction(SETTINGS_STORE, "readonly");
    const completed = transactionComplete(transaction);
    const selection = await requestResult(transaction.objectStore(SETTINGS_STORE).get("selected"));
    await completed;
    return selection?.route ?? null;
}

export async function persistCurrentRoute(route) {
    const database = await getReadyDatabase();
    const transaction = database.transaction([ROUTES_STORE, SETTINGS_STORE], "readwrite");
    const completed = transactionComplete(transaction);
    const routeStore = transaction.objectStore(ROUTES_STORE);
    const request = routeStore.get(route.createdAt);

    request.onsuccess = () => {
        if (request.result) routeStore.put(route);
        transaction.objectStore(SETTINGS_STORE).put({key: "selected", route});
    };

    await completed;
}

export async function addRouteAndSelect(route) {
    const database = await getReadyDatabase();
    const transaction = database.transaction([ROUTES_STORE, SETTINGS_STORE], "readwrite");
    const completed = transactionComplete(transaction);
    transaction.objectStore(ROUTES_STORE).put(route);
    transaction.objectStore(SETTINGS_STORE).put({key: "selected", route});
    await completed;
}

export async function selectRoute(route) {
    const database = await getReadyDatabase();
    const transaction = database.transaction(SETTINGS_STORE, "readwrite");
    const completed = transactionComplete(transaction);
    transaction.objectStore(SETTINGS_STORE).put({key: "selected", route});
    await completed;
}

export async function deleteRoute(createdAt) {
    const database = await getReadyDatabase();
    const transaction = database.transaction([ROUTES_STORE, SETTINGS_STORE], "readwrite");
    const completed = transactionComplete(transaction);
    transaction.objectStore(ROUTES_STORE).delete(createdAt);
    const selectedRequest = transaction.objectStore(SETTINGS_STORE).get("selected");
    selectedRequest.onsuccess = () => {
        if (selectedRequest.result?.route?.createdAt === createdAt) {
            transaction.objectStore(SETTINGS_STORE).delete("selected");
        }
    };
    await completed;
}
