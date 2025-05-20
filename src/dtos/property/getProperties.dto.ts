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
    this.priceMin = query.string;
    this.priceMax = query.string;
    this.beds = query.string;
    this.baths = query.string;
    this.propertyType = query.string;
    this.squareFeetMin = query.string;
    this.squareFeetMax = query.string;
    this.amenities = query.string;
    this.availableFrom = query.string;
    this.latitude = query.string;
    this.longitude = query.string;
  }
}

export default GetPropertiesDto;
