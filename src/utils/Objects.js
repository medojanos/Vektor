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

  constructor({postalCode, city, address, addressOther}) {
    this.postalCode = postalCode;
    this.city = city;
    this.address = address;
    this.addressOther = addressOther;
    this.fullAddress = `${postalCode} ${city}, ${address} ${addressOther}`;
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

  constructor({id, name, email, phone, price, deliveryPrice, parcel, note, postalCode, city, address, addressOther}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.price = price;
    this.deliveryPrice = deliveryPrice;
    this.parcel = parcel;
    this.note = note;
    this.location = new Location({postalCode, city, address, addressOther});
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
    this.startingLocation = startingLocation;
    this.endLocation = endLocation;
    this.createdAt = Date.now();
  }
}

export {Stop, Route}