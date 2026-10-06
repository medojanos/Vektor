class Location {
  postalCode;
  city;
  address;
  addressOther;
  
  fullAddress;

  coordinates = {
    lat: null,
    lon: null
  };

  constructor({postalCode, city, address, addressOther, coordinates} = {}) {
    this.postalCode = postalCode || "";
    this.city = city || "";
    this.address = address || "";
    this.addressOther = addressOther || "";
    this.fullAddress = `${postalCode || ""} ${city} ${address || ""} ${addressOther || ""}`;
    this.coordinates = coordinates || null
  }
}

class Stop {
  id;
  name;
  email;
  phone;

  price;
  deliveryPrice;

  parcel;
  note;

  location;

  active;

  routeInfo = {
    distanceFromPrevious: 0,
    durationFromPrevious: 0
  };

  constructor({id, name, email, phone, price, deliveryPrice, parcel, note, postalCode, city, address, addressOther, coordinates, active} = {}) {
    this.id = id || Date.now();
    this.name = name || "";
    this.email = email || "";
    this.phone = phone || "";
    this.price = price || 0;
    this.deliveryPrice = deliveryPrice || 0;
    this.parcel = parcel || "";
    this.note = note || "";
    this.location = new Location({postalCode, city, address, addressOther, coordinates});
    this.active = active || false;
  }
}

class Route {
  stops;

  createdAt;

  totalDistance;
  totalDuration;

  geometry;

  constructor({stops, totalDistance, totalDuration, geometry} = {}) {
    this.stops = stops || [];
    this.createdAt = Date.now();
    this.totalDistance = totalDistance || 0;
    this.totalDuration = totalDuration || 0;
    this.geometry = geometry || 0;
  }
}

export {Stop, Route}