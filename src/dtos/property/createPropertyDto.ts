class CreatePropertyDto {
  files: Express.Multer.File[];
  address: any;
  city: any;
  state: any;
  country: any;
  postalCode: any;
  managerCognitoId: any;
  propertyData: any;

  constructor(files: Express.Multer.File[], body: any) {
    this.files = files;
    const {
      address,
      city,
      state,
      country,
      postalCode,
      managerCognitoId,
      ...propertyData
    } = body;

    this.address = address;
    this.city = city;
    this.state = state;
    this.country = country;
    this.postalCode = postalCode;
    this.managerCognitoId = managerCognitoId;
    this.propertyData = propertyData;
  }
}

export default CreatePropertyDto;
