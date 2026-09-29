class Location {
  postalCode;
  city;
  address;
  addressOther;
  
  fullAddress;

  coordinates = {
    lat: null,
    lng: null
  };

  constructor({postalCode, city, address, addressOther, fullAddress, coordinates} = {}) {
    this.postalCode = postalCode || "";
    this.city = city || "";
    this.address = address || "";
    this.addressOther = addressOther || "";
    this.fullAddress = fullAddress || "";
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

  routeInfo = {
    arrival: 0,
    distanceFromPrevious: 0,
    durationFromPrevious: 0
  };

  constructor({id, name, email, phone, price, deliveryPrice, parcel, note, postalCode, city, address, addressOther, fullAddress, coordinates} = {}) {
    this.id = id || Date.now();
    this.name = name || "";
    this.email = email || "";
    this.phone = phone || "";
    this.price = price || 0;
    this.deliveryPrice = deliveryPrice || 0;
    this.parcel = parcel || "";
    this.note = note || "";
    this.location = new Location({postalCode, city, address, addressOther, fullAddress, coordinates});
  }
}

class Route {
  stops;
  startingLocation;
  endLocation;

  createdAt;

  totalDistance;
  totalDuration;

  constructor({stops, startingLocation, endLocation} = {}) {
    this.stops = stops || [];
    this.startingLocation = new Location(startingLocation);
    this.endLocation = new Location(endLocation);
    this.createdAt = Date.now();
  }
}

export {Stop, Route}