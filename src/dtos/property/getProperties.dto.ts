class GetPropertiesDto {
  favoriteIds?: string;
  priceMin?: string;
  priceMax?: string;
  beds?: string;
  baths?: string;
  propertyType?: string;
  squareFeetMin?: string;
  squareFeetMax?: string;
  amenities?: string;
  availableFrom?: string;
  latitude?: string;
  longitude?: string;

  constructor(query: any) {
    this.favoriteIds = query.favoriteIds;
    this.priceMin = query.priceMin;
    this.priceMax = query.priceMax;
    this.beds = query.beds;
    this.baths = query.baths;
    this.propertyType = query.propertyType;
    this.squareFeetMin = query.squareFeetMin;
    this.squareFeetMax = query.squareFeetMax;
    this.amenities = query.amenities;
    this.availableFrom = query.availableFrom;
    this.latitude = query.latitude;
    this.longitude = query.longitude;
  }
}

export default GetPropertiesDto;
